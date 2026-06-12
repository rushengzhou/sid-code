// _vendor stub: claude-code utils/execFileNoThrow.ts 的 execFileNoThrow 叶子函数。
// ink 仅在 termio/osc.ts 用它做 OSC52 剪贴板复制(tmux/pbcopy/wl-copy/xclip/xsel/clip)。
// 包一层 child_process.execFile,捕获异常返回 {stdout, stderr, code},绝不抛出。

import { execFile } from 'node:child_process'

export type ExecResult = {
  stdout: string
  stderr: string
  code: number
}

export type ExecFileOptions = {
  abortSignal?: AbortSignal
  timeout?: number
  preserveOutputOnError?: boolean
  useCwd?: boolean
  env?: NodeJS.ProcessEnv
  stdin?: 'ignore' | 'inherit' | 'pipe'
  input?: string
}

export function execFileNoThrow(
  file: string,
  args: string[] = [],
  options: ExecFileOptions = {},
): Promise<ExecResult> {
  return new Promise(resolve => {
    try {
      const child = execFile(
        file,
        args,
        {
          env: options.env ?? process.env,
          timeout: options.timeout,
          signal: options.abortSignal,
        },
        (error, stdout, stderr) => {
          resolve({
            stdout: stdout?.toString() ?? '',
            stderr: stderr?.toString() ?? '',
            code: error && typeof error.code === 'number' ? error.code : error ? 1 : 0,
          })
        },
      )
      if (options.input !== undefined && child.stdin) {
        child.stdin.write(options.input)
        child.stdin.end()
      }
      child.on('error', () => {
        resolve({ stdout: '', stderr: '', code: 1 })
      })
    } catch {
      resolve({ stdout: '', stderr: '', code: 1 })
    }
  })
}
