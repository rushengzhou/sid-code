// _vendor stub: claude-code utils/debug.ts 的 logForDebugging 叶子函数。
// 接 sid-code 现有 debug 机制:仅在 SID_CODE_DEBUG 环境变量开启时输出到 stderr。
// 不搬整个 debug.ts(它拉入 bufferedWriter/cleanupRegistry/fsOperations 等 6 个传递依赖)。

const DEBUG_ENABLED =
  process.env.SID_CODE_DEBUG === '1' || process.env.SID_CODE_DEBUG === 'true'

export function logForDebugging(message: string, ...rest: unknown[]): void {
  if (DEBUG_ENABLED) {
    // eslint-disable-next-line no-console
    console.error(`[ink] ${message}`, ...rest)
  }
}
