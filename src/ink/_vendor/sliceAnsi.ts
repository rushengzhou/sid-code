import {
  type AnsiCode,
  ansiCodesToString,
  reduceAnsiCodes,
  tokenize,
  undoAnsiCodes,
} from '@alcalzone/ansi-tokenize'
import { stringWidth } from '../stringWidth.js'

// A code is an "end code" if its code equals its endCode (e.g., hyperlink close)
function isEndCode(code: AnsiCode): boolean {
  return code.code === code.endCode
}

// Filter to only include "start codes" (not end codes)
function filterStartCodes(codes: AnsiCode[]): AnsiCode[] {
  return codes.filter(c => !isEndCode(c))
}

/**
 * Slice a string containing ANSI escape codes.
 *
 * Unlike the slice-ansi package, this properly handles OSC 8 hyperlink
 * sequences because @alcalzone/ansi-tokenize tokenizes them correctly.
 */
export default function sliceAnsi(
  str: string,
  start: number,
  end?: number,
): string {
  // Don't pass `end` to tokenize — it counts code units, not display cells,
  // so it drops tokens early for text with zero-width combining marks.
  const tokens = tokenize(str)
  let activeCodes: AnsiCode[] = []
  let position = 0
  let result = ''
  let include = false

  for (const token of tokens) {
    // 三种 token 类型宽度不同：'ansi'（配对开关码，如加粗开/关）宽度 0；
    // 'control'（自包含控制码，如 OSC 窗口标题，无 endCode 配对）同样宽度 0；
    // 只有 'char' 才需要按 fullWidth/stringWidth 算实际显示宽度。
    // 此前只判断了 'ansi' 和落入 else 分支的隐含 'char'，'control' 被
    // 误当 Char 处理去读 token.value/token.fullWidth——两者在 ControlCode
    // 上都不存在，取到 undefined，拼接进结果字符串变成字面量 "undefined"。
    const width =
      token.type === 'ansi' || token.type === 'control'
        ? 0
        : token.fullWidth
          ? 2
          : stringWidth(token.value)

    // Break AFTER trailing zero-width marks — a combining mark attaches to
    // the preceding base char, so "भा" (भ + ा, 1 display cell) sliced at
    // end=1 must include the ा. Breaking on position >= end BEFORE the
    // zero-width check would drop it and render भ bare. ANSI/control codes
    // are width 0 but must NOT be included past end (ANSI codes open new
    // style runs that leak into the undo sequence), so gate on token type too.
    // The !include guard ensures empty slices (start===end) stay empty even
    // when the string starts with a zero-width char (BOM, ZWJ).
    if (end !== undefined && position >= end) {
      if (token.type === 'ansi' || token.type === 'control' || width > 0 || !include) break
    }

    if (token.type === 'ansi') {
      activeCodes.push(token)
      if (include) {
        // Emit all ANSI codes during the slice
        result += token.code
      }
    } else if (token.type === 'control') {
      // 自包含控制码：没有 endCode 配对，不需要参与 activeCodes 的 undo 追踪，
      // 命中切片窗口就原样吐出。
      if (include) {
        result += token.code
      }
    } else {
      if (!include && position >= start) {
        // Skip leading zero-width marks at the start boundary — they belong
        // to the preceding base char in the left half. Without this, the
        // mark appears in BOTH halves: left+right ≠ original. Only applies
        // when start > 0 (otherwise there's no preceding char to own it).
        if (start > 0 && width === 0) continue
        include = true
        // Reduce and filter to only active start codes
        activeCodes = filterStartCodes(reduceAnsiCodes(activeCodes))
        result = ansiCodesToString(activeCodes)
      }

      if (include) {
        result += token.value
      }

      position += width
    }
  }

  // Only undo start codes that are still active
  const activeStartCodes = filterStartCodes(reduceAnsiCodes(activeCodes))
  result += ansiCodesToString(undoAnsiCodes(activeStartCodes))
  return result
}
