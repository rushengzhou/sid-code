// _vendor stub: claude-code utils/envUtils.ts 的 isEnvTruthy 叶子函数。

export function isEnvTruthy(v: string | boolean | undefined | null): boolean {
  if (!v) return false
  const s = String(v).toLowerCase()
  return s !== '' && s !== '0' && s !== 'false' && s !== 'no'
}
