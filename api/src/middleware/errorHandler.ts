import type { NextFunction, Request, Response } from 'express'
import { isDev } from '../utils/env.js'
import { logger } from '../utils/logger.js'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error('Unhandled error caught in middleware error handler', err)

  const { statusCode, message } = err

  res.status(statusCode).json({
    success: false,
    status: statusCode || 500,
    message: message || 'Internal Server Error',
    // Show stack trace only in development
    stack: isDev() ? err.stack : undefined,
  })
}
