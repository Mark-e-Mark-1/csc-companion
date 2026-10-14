import type { Block, Inline } from "../types.ts"

function Inlines({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((inline, index) => {
        if (inline.type === "strong") return <strong key={index}>{inline.text}</strong>
        if (inline.type === "em") return <em key={index}>{inline.text}</em>
        if (inline.type === "link") {
          return (
            <a key={index} href={inline.href} target="_blank" rel="noreferrer">
              {inline.text}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )
        }
        return <span key={index}>{inline.text}</span>
      })}
    </>
  )
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((block, index) => {
        if (block.type === "h3") return <h3 key={index}>{block.text}</h3>
        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inlines inlines={item} />
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index}>
            <Inlines inlines={block.inlines} />
          </p>
        )
      })}
    </div>
  )
}
