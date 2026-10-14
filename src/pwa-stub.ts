/** Stand-in for the service worker registration when building the single-file zip. */
export function registerSW(_options?: { immediate?: boolean }): () => void {
  return () => {}
}
