// _vendor stub: claude-code utils/log.ts 的 logError 叶子函数。
// 注意:绝不 import 'bun:bundle'(原 log.ts 第 1 行的编译期宏依赖),只取 logError。
// 渲染期错误统一输出到 stderr。

export function logError(error: unknown): void {
  // eslint-disable-next-line no-console
  console.error('[ink:error]', error)
}
