// Shim for react/compiler-runtime
// The React Compiler transforms components to use a caching function `c(size)`.
// This shim provides a minimal implementation that allocates a cache array.

/**
 * Creates a cache array of the given size for React Compiler memoization.
 * Each slot is initialized to a sentinel symbol so the compiler can detect
 * whether a value has been cached yet.
 */
const $empty = Symbol.for('react.memo_cache_sentinel');

export function c(size: number): any[] {
  const $ = new Array(size);
  for (let i = 0; i < size; i++) {
    $[i] = $empty;
  }
  return $;
}
