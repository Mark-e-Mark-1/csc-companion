/** Checkbox groups where "none" cannot sit beside other choices. */
export function toggleExclusive(
  current: readonly string[],
  id: string,
  exclusive = "none",
): string[] {
  if (id === exclusive) {
    return current.length === 1 && current[0] === exclusive ? [] : [exclusive]
  }
  const without = current.filter((item) => item !== exclusive)
  if (without.includes(id)) return without.filter((item) => item !== id)
  return [...without, id]
}
