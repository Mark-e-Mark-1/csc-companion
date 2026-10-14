import { Component, type ReactNode } from "react"

type Props = { children: ReactNode }
type State = { message: string | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null }

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : "Unknown error" }
  }

  render() {
    if (this.state.message) {
      return (
        <main className="wrap" id="main">
          <h1>This page ran into a problem</h1>
          <p>The reference content or this screen failed to render. Nothing was sent anywhere.</p>
          <p className="meta">{this.state.message}</p>
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
