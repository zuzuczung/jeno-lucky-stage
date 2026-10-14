/** Uniform integer in [0, bound). Reject the incomplete tail of the uint32 range. */
export function secureIndex(
  bound: number,
  fill: (array: Uint32Array) => void = (a) => {
    crypto.getRandomValues(a);
  },
): number {
  if (!Number.isInteger(bound) || bound < 1 || bound > 0x100000000)
    throw new Error("Invalid random bound");
  const ceiling = Math.floor(0x100000000 / bound) * bound;
  const buffer = new Uint32Array(1);
  do {
    fill(buffer);
  } while (buffer[0] >= ceiling);
  return buffer[0] % bound;
}
export function randomPicker<T>(
  eligible: readonly T[],
  count: number,
  index = secureIndex,
): T[] {
  if (!Number.isInteger(count) || count < 1 || count > eligible.length)
    throw new Error("Not enough eligible fans");
  const pool = [...eligible];
  for (let i = 0; i < count; i++) {
    const j = i + index(pool.length - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
