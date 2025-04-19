import compression from 'compression'
import cors from 'cors'
import express, { Application } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

/**
 * The `injectMiddleWares` function adds CORS, compression, and helmet middleware to an Express
 * application.
 * @param {Application} app - The `app` parameter in the `injectMiddleWares` function is of type
 * `Application`, which is likely referring to an instance of an Express application. This parameter is
 * used to apply middleware functions to the Express application to enhance its functionality, such as
 * adding CORS support, compression, and security headers
 */
export const injectMiddleWares = async (app: Application) => {
  app.use(cors())
  app.use(compression())
  app.use(helmet())
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(
    morgan(
      '[:date[clf]] - :method :url :status :res[content-length] - :response-time ms'
    )
  )
}
