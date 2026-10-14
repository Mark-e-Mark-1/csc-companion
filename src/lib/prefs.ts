const KEY = "csc-ui-prefs"

export type TextSize = "default" | "large"

/** UI preference only. Screener answers and intake selections are never written here. */
export function readTextSize(): TextSize {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return "default"
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === "object" &&
      "textSize" in parsed &&
      (parsed as { textSize?: unknown }).textSize === "large"
    ) {
      return "large"
    }
  } catch {
    /* Ignore unreadable preference data. */
  }
  return "default"
}

export function writeTextSize(textSize: TextSize) {
  localStorage.setItem(KEY, JSON.stringify({ textSize }))
}
