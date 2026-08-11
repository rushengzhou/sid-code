// _vendor: claude-code 自研 ink 未导出这 5 个 StyledChar 工具函数(jrichman 特有)。
// TableRenderer 用它们做 ANSI 感知的宽度计算与换行,保证 CJK 表格列宽正确。
// 全部基于 @alcalzone/ansi-tokenize 的 StyledChar 模型 + ink 的 stringWidth 实现。
//
// 语义对齐 jrichman ink:
//   toStyledCharacters(str)          : string → StyledChar[]
//   styledCharsWidth(chars)          : StyledChar[] → 显示列宽合计
//   wordBreakStyledChars(chars)      : StyledChar[] → StyledChar[][](按空白切词,保留空白词)
//   wrapStyledChars(chars, width)    : StyledChar[] → StyledChar[][](按列宽硬/软换行)
//   widestLineFromStyledChars(lines) : StyledChar[][] → 最宽行的列宽

import {
  tokenize,
  styledCharsFromTokens,
  type StyledChar,
} from '@alcalzone/ansi-tokenize'
import { stringWidth } from '../stringWidth.js'

export type { StyledChar }

/** 单个 StyledChar 的显示宽度: fullWidth 字符占 2 列,其余按 stringWidth 计。 */
function charWidth(ch: StyledChar): number {
  if (ch.fullWidth) return 2
  return stringWidth(ch.value)
}

/** string → StyledChar[](保留 ANSI 样式)。 */
export function toStyledCharacters(str: string): StyledChar[] {
  return styledCharsFromTokens(tokenize(str))
}

/** StyledChar[] 的显示列宽合计。 */
export function styledCharsWidth(chars: StyledChar[]): number {
  let w = 0
  for (const ch of chars) w += charWidth(ch)
  return w
}

/**
 * 按空白边界切词。返回词数组,每个词是 StyledChar[]。
 * 空白本身作为独立的"空白词"保留(与 jrichman 行为一致,供换行算法决定是否丢弃)。
 */
export function wordBreakStyledChars(chars: StyledChar[]): StyledChar[][] {
  const words: StyledChar[][] = []
  let current: StyledChar[] = []
  let currentIsSpace: boolean | null = null

  for (const ch of chars) {
    const isSpace = ch.value === ' ' || ch.value === '\t'
    if (currentIsSpace === null) {
      currentIsSpace = isSpace
      current.push(ch)
    } else if (isSpace === currentIsSpace) {
      current.push(ch)
    } else {
      words.push(current)
      current = [ch]
      currentIsSpace = isSpace
    }
  }
  if (current.length > 0) words.push(current)
  return words
}

/**
 * 按目标列宽换行。优先在空白处软换行;单词超过列宽时硬切。
 * 返回行数组,每行是 StyledChar[]。
 */
export function wrapStyledChars(
  chars: StyledChar[],
  maxWidth: number,
): StyledChar[][] {
  if (maxWidth <= 0) return [chars]

  const lines: StyledChar[][] = []
  let line: StyledChar[] = []
  let lineWidth = 0

  const pushLine = () => {
    lines.push(line)
    line = []
    lineWidth = 0
  }

  const words = wordBreakStyledChars(chars)
  for (const word of words) {
    const isSpace = word[0]?.value === ' ' || word[0]?.value === '\t'
    let wordWidth = 0
    for (const ch of word) wordWidth += charWidth(ch)

    // 行首的空白词丢弃(避免软换行后行首悬空空格)。
    if (isSpace && lineWidth === 0) continue

    if (lineWidth + wordWidth <= maxWidth) {
      line.push(...word)
      lineWidth += wordWidth
      continue
    }

    // 放不下: 先结束当前行(若非空)。空白词直接吞掉,不带入下一行。
    if (isSpace) {
      if (lineWidth > 0) pushLine()
      continue
    }

    // 非空白词且单词本身 <= maxWidth: 整词移到下一行。
    if (wordWidth <= maxWidth) {
      if (lineWidth > 0) pushLine()
      line.push(...word)
      lineWidth = wordWidth
      continue
    }

    // 单词超长: 逐字符硬切。
    for (const ch of word) {
      const cw = charWidth(ch)
      if (lineWidth + cw > maxWidth && lineWidth > 0) pushLine()
      line.push(ch)
      lineWidth += cw
    }
  }
  pushLine()
  // 至少返回一行(空内容时返回 [[]],与 jrichman 一致)。
  return lines.length > 0 ? lines : [[]]
}

/** StyledChar[][](多行)中最宽行的显示列宽。 */
export function widestLineFromStyledChars(lines: StyledChar[][]): number {
  let max = 0
  for (const line of lines) {
    const w = styledCharsWidth(line)
    if (w > max) max = w
  }
  return max
}
