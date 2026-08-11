// _vendor: claude-code 自研 ink 未提供 getBoundingBox(jrichman 特有)。
// ScrollProvider 用它做鼠标命中检测,读取元素的绝对屏幕矩形 {x,y,width,height}。
// 实现: 沿 DOM parentNode 链累加 yogaNode 的 computedLeft/Top 得到绝对坐标,
// 并像 renderer 那样减去滚动容器的 scrollTop(yoga 布局不含滚动偏移,渲染期才应用)。

import type { DOMElement } from '../dom.js'

export type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export function getBoundingBox(element: DOMElement | null): BoundingBox | null {
  if (!element?.yogaNode) return null

  const width = element.yogaNode.getComputedWidth()
  const height = element.yogaNode.getComputedHeight()

  let x = element.yogaNode.getComputedLeft()
  let y = element.yogaNode.getComputedTop()

  // 沿 DOM 父链累加各祖先 yogaNode 的 left/top,得到绝对屏幕坐标。
  // 用 DOM parentNode(而非 yoga.getParent())以便识别滚动容器并减去其 scrollTop。
  let parent: DOMElement | undefined = element.parentNode
  while (parent) {
    if (parent.yogaNode) {
      x += parent.yogaNode.getComputedLeft()
      y += parent.yogaNode.getComputedTop()
    }
    // scrollTop 只在滚动容器上设置(ScrollBox + renderer);非滚动节点为 undefined。
    if (parent.scrollTop) y -= parent.scrollTop
    parent = parent.parentNode
  }

  return { x, y, width, height }
}

export default getBoundingBox
