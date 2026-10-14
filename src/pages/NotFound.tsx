import { Link } from "react-router"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function NotFound() {
  usePageTitle("Page not found")
  return (
    <>
      <h1 id="page-title" tabIndex={-1}>
        That page is not in the companion
      </h1>
      <p>The link may be old, or the address was typed by hand.</p>
      <p>
        <Link to="/">Back to the start</Link>
      </p>
    </>
  )
}
