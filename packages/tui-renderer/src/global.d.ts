// Global type declarations for ink components
//
// 声明 ink 自有的宿主元素（host element）。这些不是 DOM 标签，而是
// `src/ink/reconciler.ts` 通过 react-reconciler 创建的自定义宿主类型
// （枚举见 `src/ink/dom.ts` 的 `ElementNames`），最终由
// `render-node-to-output.ts` 画成终端字符。
//
// 本文件此前是个空 stub（只有 `export {}`），但 Box.tsx / ScrollBox.tsx 一直
// `import '../global.d.ts'`，说明作者本就把它当作声明放置处 —— 只是内容从未补上。
// 缺了它，所有 `<ink-box>` / `<ink-text>` / `<ink-link>` / `<ink-raw-ansi>`
// 在 tsc 下都报 TS2339「Property 'ink-box' does not exist on type
// 'JSX.IntrinsicElements'」（P1-3 里 src/ink 的主要错误来源）。
//
// 注意：`export {}` 会让本文件变成模块，模块内的 `declare global` 才生效；
// 而 Box/ScrollBox 里的 `import '../global.d.ts'` 依赖它是模块。两者一致，别删。

import type { DOMElement } from "./dom.js";
import type { ClickEvent } from "./events/click-event.js";
import type { FocusEvent } from "./events/focus-event.js";
import type { KeyboardEvent } from "./events/keyboard-event.js";
import type { Styles, TextStyles } from "./styles.js";

/** ink-box 支持的事件与焦点属性（与 components/Box.tsx 的 Props 对齐） */
type InkBoxHostProps = {
  ref?: React.Ref<DOMElement>;
  style?: Styles;
  /** Tab 序号：>= 0 参与 Tab/Shift+Tab 循环，-1 仅可编程聚焦 */
  tabIndex?: number;
  /** 挂载即聚焦，由 reconciler 的 commitMount 阶段调用 FocusManager */
  autoFocus?: boolean;
  onClick?: (event: ClickEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onFocusCapture?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onBlurCapture?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyDownCapture?: (event: KeyboardEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /**
   * 作为 DOM 属性直传（而非走 ref）：ref 回调在首次 commit 之后才触发，
   * 对第一帧来说太晚。见 components/ScrollBox.tsx 的注释。
   */
  stickyScroll?: boolean;
  children?: React.ReactNode;
};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "ink-box": InkBoxHostProps;
        "ink-text": {
          style?: Styles;
          /** 文本装饰（颜色/粗体/下划线等），由 reconciler 写到 node.textStyles */
          textStyles?: TextStyles;
          children?: React.ReactNode;
        };
        "ink-virtual-text": {
          style?: Styles;
          textStyles?: TextStyles;
          children?: React.ReactNode;
        };
        "ink-link": {
          /** OSC 8 超链接目标 */
          href?: string;
          children?: React.ReactNode;
        };
        "ink-raw-ansi": {
          /** 预渲染好的 ANSI 字符串，跳过布局测量直接落盘到输出 */
          rawText?: string;
          /** 已知宽高：ink-raw-ansi 的 measure 函数直接用它，不再解析内容 */
          rawWidth?: number;
          rawHeight?: number;
        };
      }
    }
  }
}

export {};
