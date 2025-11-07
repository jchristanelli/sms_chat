export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 100,
  maxDelay = 5000,
): Promise<T> {
  let attempt = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= maxRetries) {
        throw err
      }

      const jitter = Math.random() * delay
      await new Promise((res) => setTimeout(res, delay + jitter))
      delay = Math.min(delay * 2, maxDelay)
      attempt++
    }
  }
}
