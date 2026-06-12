// _vendor stub: claude-code utils/semver.ts 的 gte 叶子函数。
// ink terminal.ts 用它比较终端版本号(ghostty/iTerm 扩展键支持判断)。
// 直接用已安装的 semver 包,容错处理非法版本号。

import semverGte from 'semver/functions/gte.js'
import semverCoerce from 'semver/functions/coerce.js'

export function gte(a: string, b: string): boolean {
  try {
    const ca = semverCoerce(a)
    const cb = semverCoerce(b)
    if (!ca || !cb) return false
    return semverGte(ca, cb)
  } catch {
    return false
  }
}
