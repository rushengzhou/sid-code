// 测试基建: ink-testing-library 已随 jrichman ink 一并移除。
// 本 shim 在 vendored ink 上重建测试所需的最小 API: render() + lastFrame()。
//
// 原理(对标 claude-code staticRender.tsx 的 renderToAnsiString):
// 用 PassThrough 作为非 TTY stdout 捕获 ink 全部写入。非 TTY 模式下 ink 输出整帧
// (而非增量 diff),每帧包裹在 DEC 同步序列 [?2026h ... [?2026l 中。
// lastFrame() 返回最近一帧的内容。

import React from 'react'
import { PassThrough } from 'node:stream'
import { renderSync } from '../root.js'

const SYNC_START = '\x1b[?2026h'
const SYNC_END = '\x1b[?2026l'

/** 从累计输出里取最后一个完整帧的内容(去掉 DEC 同步包裹)。 */
function extractLastFrame(output: string): string {
  const lastStart = output.lastIndexOf(SYNC_START)
  if (lastStart === -1) return output
  const contentStart = lastStart + SYNC_START.length
  const endIndex = output.indexOf(SYNC_END, contentStart)
  if (endIndex === -1) return output.slice(contentStart)
  return output.slice(contentStart, endIndex)
}

export type RenderResult = {
  lastFrame: () => string | undefined
  frames: string[]
  rerender: (node: React.ReactElement) => void
  unmount: () => void
  stdin: { write: (data: string) => void }
  stdout: { get: () => string }
}

export type RenderOptions = {
  columns?: number
  rows?: number
}

export function render(
  node: React.ReactElement,
  options?: RenderOptions,
): RenderResult {
  let output = ''

  const stdout = new PassThrough() as unknown as NodeJS.WriteStream & {
    columns: number
    rows: number
  }
  stdout.columns = options?.columns ?? 80
  stdout.rows = options?.rows ?? 24
  // 非 TTY → ink 输出整帧
  ;(stdout as unknown as { isTTY: boolean }).isTTY = false
  stdout.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })

  const stdin = new PassThrough() as unknown as NodeJS.ReadStream
  const stdinAny = stdin as unknown as Record<string, unknown>
  stdinAny.isTTY = true
  stdinAny.setRawMode = () => stdin
  stdinAny.ref = () => stdin
  stdinAny.unref = () => stdin

  const instance = renderSync(node, {
    stdout,
    stdin,
    patchConsole: false,
    exitOnCtrlC: false,
  })

  return {
    lastFrame: () => extractLastFrame(output),
    get frames() {
      // 拆出所有帧
      const parts: string[] = []
      let idx = 0
      while (true) {
        const s = output.indexOf(SYNC_START, idx)
        if (s === -1) break
        const cs = s + SYNC_START.length
        const e = output.indexOf(SYNC_END, cs)
        if (e === -1) { parts.push(output.slice(cs)); break }
        parts.push(output.slice(cs, e))
        idx = e + SYNC_END.length
      }
      return parts
    },
    rerender: (next: React.ReactElement) => {
      instance.rerender(next)
    },
    unmount: () => {
      instance.unmount()
    },
    stdin: {
      write: (data: string) => {
        stdin.emit('data', Buffer.from(data))
      },
    },
    stdout: {
      get: () => output,
    },
  }
}
