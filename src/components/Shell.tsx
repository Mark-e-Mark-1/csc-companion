import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router"
import { site } from "../data/loadContent.ts"
import { readTextSize, writeTextSize, type TextSize } from "../lib/prefs.ts"

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/screener", label: "Screener", end: false },
  { to: "/intake", label: "Intake", end: false },
  { to: "/development", label: "Development", end: false },
  { to: "/conditions", label: "Conditions", end: false },
  { to: "/training", label: "Training", end: false },
  { to: "/practice", label: "Practice", end: false },
]

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const urlQuery = params.get("q") ?? ""
  const [open, setOpen] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>(() => readTextSize())
  const [query, setQuery] = useState(urlQuery)
  const [seenQuery, setSeenQuery] = useState(urlQuery)
  const [seenPath, setSeenPath] = useState(location.pathname)
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstLoad = useRef(true)

  if (urlQuery !== seenQuery) {
    setSeenQuery(urlQuery)
    setQuery(urlQuery)
  }
  if (location.pathname !== seenPath) {
    setSeenPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    document.documentElement.dataset.text = textSize
  }, [textSize])

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    document.getElementById("page-title")?.focus()
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault()
        document.getElementById("site-search")?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = query.trim()
    navigate(next ? `/search?q=${encodeURIComponent(next)}` : "/search")
    setOpen(false)
  }

  function chooseSize(next: TextSize) {
    setTextSize(next)
    writeTextSize(next)
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="sticky-top">
        <div className="banner" role="note">
          <p className="banner-kicker">Reference tool</p>
          <p className="banner-title">{site.banner}</p>
          <p className="banner-detail">{site.bannerDetail}</p>
        </div>
        <header className="topbar">
          <div className="wrap topbar-row">
            <NavLink to="/" className="brand" end>
              <span className="brand-org">{site.org}</span>
              <span className="brand-name">{site.name}</span>
            </NavLink>
            <form className="search-form" role="search" onSubmit={onSearch}>
              <label className="sr-only" htmlFor="site-search">
                Search the companion. Do not type patient information.
              </label>
              <input
                id="site-search"
                type="search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search scope, cards, training"
                autoComplete="off"
                enterKeyHint="search"
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </form>
            <button
              ref={menuButton}
              className="menu-button"
              type="button"
              aria-expanded={open}
              aria-controls="site-nav"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
          <nav id="site-nav" className={open ? "nav-panel is-open" : "nav-panel"} aria-label="Sections">
            <div className="wrap nav-row">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>
      </div>
      <main id="main" className="wrap main">
        {children}
      </main>
      <footer className="site-footer">
        <div className="wrap footer-row">
          <p>{site.footer}</p>
          <div className="text-size" role="group" aria-label="Text size">
            <span id="text-size-label">Text size</span>
            <button
              type="button"
              className="btn btn-ghost"
              aria-pressed={textSize === "default"}
              onClick={() => chooseSize("default")}
            >
              Default
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-pressed={textSize === "large"}
              onClick={() => chooseSize("large")}
            >
              Large
            </button>
          </div>
          <p className="meta">
            No account. No patient data stored. Text size is the only thing saved on this device.
          </p>
        </div>
      </footer>
    </>
  )
}
