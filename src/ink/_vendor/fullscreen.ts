// _vendor stub: claude-code utils/fullscreen.ts 的 isMouseClicksDisabled 叶子函数。
// 读 SID_CODE_DISABLE_MOUSE_CLICKS 环境变量返回 boolean。

import { isEnvTruthy } from './envUtils.js'

export function isMouseClicksDisabled(): boolean {
  return isEnvTruthy(process.env.SID_CODE_DISABLE_MOUSE_CLICKS)
}
