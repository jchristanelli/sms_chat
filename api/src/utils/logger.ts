const errorCounter: Record<string, number> = {}
let totalErrorCount = 0
export const logger = {
  log: (message: string): void => {
    console.log(`${message}`)
  },
  error: (message: string, err?: any): void => {
    // Keep track of errors
    totalErrorCount++
    errorCounter[message] = (errorCounter[message] || 0) + 1
    console.error(`ERROR: ${message}`, err)
  },
  getErrorCounts: () => ({
    errors: { ...errorCounter },
    totalErrorCount,
  }),
}
