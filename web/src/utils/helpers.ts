export function findByAorB<T, K1 extends keyof T, K2 extends keyof T> (
  array: T[],
  newItem: Partial<T>,
  keyA: K1,
  keyB: K2,
): number {
  return array.findIndex(
    item =>
      (newItem[keyA] !== undefined && item[keyA] === newItem[keyA])
      || (newItem[keyB] !== undefined && item[keyB] === newItem[keyB]),
  )
}
