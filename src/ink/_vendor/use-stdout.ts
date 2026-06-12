// _vendor 兼容 hook: claude-code 自研 ink 没有 useStdout(jrichman 特有)。
// sid-code 有 9 个文件依赖它,统一用法是读 stdout.columns / stdout.rows,
// 个别还用 stdout.write / stdout.on("resize")(真实 process.stdout 方法)。
//
// 策略: 返回真实 process.stdout(保留 write/on 等方法),但 columns/rows
// 改为响应式 —— 优先取 ink 的 TerminalSizeContext(随终端 resize 由 ink 驱动重渲染),
// 回退到 process.stdout.columns/rows。这样 9 个 consumer 只需改 import 路径,无需改函数体。

import { useContext } from 'react'
import { TerminalSizeContext } from '../components/TerminalSizeContext.js'

export type StdoutInstance = {
  stdout: NodeJS.WriteStream & { columns: number; rows: number }
  write: (data: string) => void
}

export function useStdout(): StdoutInstance {
  const size = useContext(TerminalSizeContext)
  const base = process.stdout

  // 用响应式 columns/rows 覆盖 process.stdout 的同名属性。
  // 通过原型代理保留 write / on / off 等真实方法。
  const proxied = new Proxy(base, {
    get(target, prop) {
      if (prop === 'columns') {
        return size?.columns ?? target.columns ?? 80
      }
      if (prop === 'rows') {
        return size?.rows ?? target.rows ?? 24
      }
      const value = Reflect.get(target, prop, target)
      return typeof value === 'function' ? value.bind(target) : value
    },
  }) as NodeJS.WriteStream & { columns: number; rows: number }

  return {
    stdout: proxied,
    write: (data: string) => {
      base.write(data)
    },
  }
}

export default useStdout
