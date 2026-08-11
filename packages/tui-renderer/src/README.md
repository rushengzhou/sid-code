# `src/ink/` —— 来源说明（请先读这一份，再读代码）

> **这个目录不是本项目原创。** 它的血统、许可状态、以及我们正在做的重构，
> 完整记录在仓库根的 [`NOTICE`](../../NOTICE) 第 1 节。**本文件是摘要，`NOTICE` 是正本。**

## 一句话

终端渲染底座，fork 自 MIT 许可的上游 [`ink`](https://github.com/vadimdemedes/ink)，
但**引入途径是一份 Claude Code（Anthropic 闭源产品）的泄露源码快照** ——
Anthropic 在 MIT 骨架上的增量修改属于 Anthropic，**我们未获授权**。
本项目非商业化，无意侵权，**这部分代码正在被重构掉，工作进行中**。

## 三层血统

```
Vadym Demedes / Sindre Sorhus 的 ink（MIT，公开）
    ↓ fork 并大幅改写
Anthropic 在 Claude Code 内维护的 ink 衍生版本   ← ⚠️ 这一层没给我们任何许可
    ↓ 经由 2026-03-31 npm source map 泄露快照引入
sid-code 的 src/ink/
```

## 规模（脚本实测，2026-08-10）

| 项 | 数值 |
| --- | --- |
| `src/ink/` 合计 | 121 文件 / 23643 行 |
| 与上游 `ink@6.6.0` 同名 | 32 文件 / 12484 行 |
| `_vendor/`（多为 npm 包薄封装 + stub） | 20 文件 / 3629 行 |
| **对照：上游 `ink` 全部源码** | **3979 行** |

最后一行是关键：**同名 ≠ 同内容**。骨架和 API 形状来自 MIT 上游，
当前主体实现表达是在其之上新加的（`ink.tsx` 上游约 440 行 → 本地 1759 行）。
所以「上游是 MIT」只缩小范围，不消除问题 —— 别拿它当免罪符。

## 代码里的上游指纹：刻意保留，不要清理

以下几处是上游 ink 自己留下的痕迹，是血统的直接证据：

- `events/input-event.ts:50,95` —— `TODO(vadimdemedes): ...`
- `reconciler.ts:32` —— `// See https://github.com/vadimdemedes/ink/issues/384`
- `components/App.tsx:215,217` —— 报错文案含 `vadimdemedes/ink#israwmodesupported`

同理，`_vendor/*` 里那些写着「照搬 claude-code」「claude-code 自研 ink 没有 X」的注释
**也一律保留**。

> ⛔ **不要以「清理痕迹」「统一措辞」「看着不专业」为由删除或改写这些注释。**
> 删掉它们不会降低风险，只会把过失侵权变成故意侵权，法律后果更重，
> 且让任何想核实来源的人无从核实。措辞不准可以改准确，来源事实不许抹掉。

## 重构方向（进行中，按残余暴露面排序）

1. `_vendor/yoga-layout/`（2728 行）→ 换回 npm `yoga-layout`（MIT, Meta）。
   须先验 `bun build --compile` 能否打包 WASM/asm.js —— 当初移植为纯 TS 很可能正是为此。
2. `termio/*` —— ECMA-48 / XTerm ctlseqs 的规范实现，可按公开规范自行实现或换 MIT 替代品。
3. `screen.ts` + `selection.ts`（2405 行）—— 真正的核心（cell 级增量刷新、屏幕级选区引擎），
   需 clean-room 重写。这是最后一块，也是最难的一块。

**这不是 all-or-nothing，可按顺序分批换。** 详细审计与路径见
`docs/bugfixes/todo/开源准备-项目工程化差距全量清单.md` §1 P0-1。

## 改这个目录的代码之前

TUI 的样式与交互铁律在 [`../ui/CLAUDE.md`](../ui/CLAUDE.md)，改渲染层前必读。
