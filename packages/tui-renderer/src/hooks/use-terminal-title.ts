import { useContext, useEffect } from "react";
import stripAnsi from "strip-ansi";
import { OSC, osc } from "../termio/osc.js";
import { TerminalWriteContext } from "../useTerminalNotification.js";

/**
 * Declaratively set the terminal tab/window title.
 *
 * Pass a string to set the title. ANSI escape sequences are stripped
 * automatically so callers don't need to know about terminal encoding.
 * Pass `null` to opt out — the hook becomes a no-op and leaves the
 * terminal title untouched.
 *
 * On Windows, uses `process.title` (classic conhost doesn't support OSC).
 * Elsewhere, writes BOTH OSC 2 (set window title) and OSC 0 (set title+icon).
 *
 * 为何两条都发:xterm.js（VS Code 集成终端的内核）对 OSC 0 标为 "Partial"、
 * 对 OSC 2 标为完整支持。只发 OSC 0 在部分 xterm.js 版本/配置下标题可能不更新。
 * 同时发 OSC 2 + OSC 0 可覆盖 xterm.js（VS Code）与传统 xterm/iTerm2 两类终端，
 * 与 claude-code issue #18326 的建议一致。重复设置同一标题无副作用。
 */
export function useTerminalTitle(title: string | null): void {
  const writeRaw = useContext(TerminalWriteContext);

  useEffect(() => {
    if (title === null || !writeRaw) return;

    const clean = stripAnsi(title);

    if (process.platform === "win32") {
      process.title = clean;
    } else {
      // OSC 2（window title，xterm.js 完整支持）+ OSC 0（title+icon，兜底）。
      writeRaw(osc(OSC.SET_TITLE, clean));
      writeRaw(osc(OSC.SET_TITLE_AND_ICON, clean));
    }
  }, [title, writeRaw]);
}
