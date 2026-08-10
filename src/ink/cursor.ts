// Stub: ink/cursor.ts

/**
 * 光标位置 + 可见性。`Frame.cursor`（frame.ts）、`renderer.ts`、`log-update.ts`
 * 的 `VirtualScreen.cursor` 都构造这个形状——之前本文件只剩 3 个空函数，类型
 * 随 vendoring 一起被删掉了，`frame.ts` 里 `import type { Cursor } from './cursor.js'`
 * 找不到导出（TS2305）。
 */
export type Cursor = {
  x: number
  y: number
  visible: boolean
}

export function moveCursor(x: number, y: number): string { return '' }
export function hideCursor(): string { return '' }
export function showCursor(): string { return '' }
