import { useEffect } from "react"

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title =
      title === "CSC Clinical Companion" ? title : `${title} · CSC Clinical Companion`
  }, [title])
}
