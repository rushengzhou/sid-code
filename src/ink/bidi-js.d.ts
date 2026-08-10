/**
 * `bidi-js` 没有官方类型也没有 `@types/bidi-js`（DefinitelyTyped 未收录）。
 * 这里只声明本仓库实际用到的那一小片 API（`bidi.ts` 只调 `getEmbeddingLevels`），
 * 不追求覆盖全部导出——多余的类型没有验证来源，宁可缺失时再补。
 *
 * 形状核对自 node_modules/.bun/bidi-js@1.0.3/node_modules/bidi-js/dist/bidi.js：
 * `getEmbeddingLevels` 返回 `{ levels: Uint8Array, paragraphs: [...] }`（第 795 行）。
 */
declare module 'bidi-js' {
  export type EmbeddingLevelsResult = {
    levels: Uint8Array
    paragraphs: Array<{ start: number; end: number }>
  }

  export type BidiInstance = {
    getEmbeddingLevels(text: string, baseDirection?: 'ltr' | 'rtl' | 'auto'): EmbeddingLevelsResult
  }

  export default function bidiFactory(): BidiInstance
}
