// _vendor 兼容组件: claude-code 自研 ink 没有 <Static>(jrichman 特有)。
//
// 设计依据: claude-code 的 REPL 主屏从不使用 <Static> —— 其 log-update.ts 引擎做
// cell 级 diff,重渲染未变化的历史行产生空 diff(零终端写入),所以 jrichman <Static>
// "只渲染一次" 的优化在这里是冗余的。内容超出视口时由 log-update 自然滚入终端 scrollback。
//
// 因此本兼容组件用一个普通竖向 Box 承载全部 items,保持与 jrichman <Static> 完全一致的
// API(items + (item,index)=>ReactNode 渲染函数 + 可选 style 透传),让 MainScreenLayout
// 无需改渲染逻辑,只换 import。

import React from 'react'
import Box from '../components/Box.js'
import type { Props as BoxProps } from '../components/Box.js'

type StaticProps<T> = {
  items: T[]
  children: (item: T, index: number) => React.ReactNode
  style?: BoxProps
}

function StaticInner<T>({ items, children, style }: StaticProps<T>) {
  return (
    <Box flexDirection="column" {...style}>
      {items.map((item, index) => children(item, index))}
    </Box>
  )
}

// 与 jrichman 一致: Static 内容稳定时不应触发额外重渲染。用 memo 在 items 引用不变时跳过。
export const Static = React.memo(StaticInner) as typeof StaticInner

export default Static
