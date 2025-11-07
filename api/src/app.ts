import express from 'express'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler.js'
import { protectedRouter, publicRouter } from './routes.js'
import { isDev } from './utils/env.js'

const app = express()

if (isDev()) {
  // Log traffic
  app.use(morgan('combined'))
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', publicRouter)
app.use('/api', protectedRouter)
app.use(errorHandler)

export default app
