import winston, { format } from 'winston'

/* This code snippet is creating a logger instance named `appLogger` using the Winston logging library
in TypeScript. Here's a breakdown of what it does: */
export const appLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        format.colorize(),
        format.simple()
        // format.timestamp(),
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
//   appLogger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   )
// }
