import { ApiResponseInterface } from '@/types/api_response'

/* The `AppError` class in TypeScript extends the Error class and captures stack traces for custom
error handling with an ApiResponseInterface property. */
export class AppError extends Error {
  public error: ApiResponseInterface

  /**
   * This TypeScript constructor function handles errors by setting a user-friendly message and
   * capturing the stack trace.
   * @param {ApiResponseInterface | string} error - The `error` parameter in the constructor function
   * can be either an object that implements the `ApiResponseInterface` interface or a string.
   */
  constructor(error: ApiResponseInterface | string) {
    let userMessage = ''
    typeof error == 'string'
      ? (userMessage = error)
      : (userMessage = error.message || '')

    super(userMessage)
    this.error = typeof error == 'object' ? error : { message: error, data: [] }
    Error.captureStackTrace(this, this.constructor)
  }
}
