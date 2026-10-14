import type { Block, Inline } from "../types.ts"

const INLINE =
  /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g

export function parseInlines(input: string): Inline[] {
  const out: Inline[] = []
  const re = new RegExp(INLINE.source, "g")
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(input))) {
    if (match.index > last) {
      out.push({ type: "text", text: input.slice(last, match.index) })
    }
    if (match[1] !== undefined) out.push({ type: "strong", text: match[1] })
    else if (match[2] !== undefined) out.push({ type: "em", text: match[2] })
    else if (match[3] !== undefined && match[4] !== undefined) {
      out.push({ type: "link", text: match[3], href: match[4] })
    }
    last = match.index + match[0].length
  }
  if (last < input.length) out.push({ type: "text", text: input.slice(last) })
  return out.length ? out : [{ type: "text", text: "" }]
}

export function parseBlocks(body: string): Block[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  function flushParagraph() {
    if (!paragraph.length) return
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim()
    paragraph = []
    if (text) blocks.push({ type: "p", inlines: parseInlines(text) })
  }

  function flushList() {
    if (!list.length) return
    blocks.push({
      type: "ul",
      items: list.map((item) => parseInlines(item.trim())),
    })
    list = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("### ")) {
      flushParagraph()
      flushList()
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() })
      continue
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph()
      list.push(trimmed.slice(2))
      continue
    }
    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }
    flushList()
    paragraph.push(trimmed)
  }
  flushParagraph()
  flushList()
  return blocks
}

export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === "h3") return block.text
      if (block.type === "p") return inlinesToText(block.inlines)
      return block.items.map((item) => inlinesToText(item)).join(" ")
    })
    .join(" ")
}

export function inlinesToText(inlines: Inline[]): string {
  return inlines
    .map((inline) => {
      if (inline.type === "link") return inline.text
      return inline.text
    })
    .join("")
}
