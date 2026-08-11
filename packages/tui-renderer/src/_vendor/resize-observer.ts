// _vendor: claude-code 自研 ink 未提供 ResizeObserver(jrichman 特有)。
// VirtualizedList 用它监听容器/项目的高度变化触发重新测量。
//
// ink 的 onComputeLayout 只在 rootNode 上触发,无法挂到任意节点。
// 因此采用轮询式 polyfill: 按帧节奏(~16ms)读取被观察节点的 yoga 计算尺寸,
// 尺寸变化时回调。entry 形状对齐 VirtualizedList 期望: { target, contentRect: { width, height } }。
// 这是 TUI 环境下 ResizeObserver 的标准实现方式(无 DOM 原生回流事件可依赖)。

import type { DOMElement } from '../dom.js'

export type ResizeObserverEntry = {
  target: DOMElement
  contentRect: {
    width: number
    height: number
    x: number
    y: number
    top: number
    left: number
    right: number
    bottom: number
  }
}

export type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver,
) => void

const POLL_INTERVAL_MS = 16 // ~60fps,与 ink 渲染节奏一致

function measure(node: DOMElement): { width: number; height: number } {
  return {
    width: node.yogaNode?.getComputedWidth() ?? 0,
    height: node.yogaNode?.getComputedHeight() ?? 0,
  }
}

export class ResizeObserver {
  private callback: ResizeObserverCallback
  private observed = new Map<DOMElement, { width: number; height: number }>()
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(node: DOMElement): void {
    if (this.observed.has(node)) return
    this.observed.set(node, measure(node))
    this.start()
    // 首帧立即上报一次初始尺寸(对齐原生 ResizeObserver 的初始触发行为)。
    queueMicrotask(() => {
      if (this.observed.has(node)) {
        this.callback([this.makeEntry(node, measure(node))], this)
      }
    })
  }

  unobserve(node: DOMElement): void {
    this.observed.delete(node)
    if (this.observed.size === 0) this.stop()
  }

  disconnect(): void {
    this.observed.clear()
    this.stop()
  }

  private makeEntry(
    target: DOMElement,
    size: { width: number; height: number },
  ): ResizeObserverEntry {
    return {
      target,
      contentRect: {
        width: size.width,
        height: size.height,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: size.width,
        bottom: size.height,
      },
    }
  }

  private start(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
    // 不阻止进程退出
    if (typeof this.timer === 'object' && this.timer && 'unref' in this.timer) {
      ;(this.timer as { unref: () => void }).unref()
    }
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private poll(): void {
    const changed: ResizeObserverEntry[] = []
    for (const [node, prev] of this.observed) {
      const cur = measure(node)
      if (cur.width !== prev.width || cur.height !== prev.height) {
        this.observed.set(node, cur)
        changed.push(this.makeEntry(node, cur))
      }
    }
    if (changed.length > 0) {
      this.callback(changed, this)
    }
  }
}

export default ResizeObserver
