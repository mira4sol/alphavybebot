import { AppError } from '@/utils/custom_error/app_error'
import { ResponseHandler } from '@/utils/custom_error/response_handler'
import { Response } from 'express'
import { z } from 'zod'

export function Validate(schema: z.ZodObject<any>) {
  return function (
    target: unknown,
    propertKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalFunction = descriptor.value
    descriptor.value = async function (...args: Array<unknown>) {
      const validatedData = schema.safeParse((args[0] as Request).body) // Access body specifically

      if (!validatedData.success) {
        return new ResponseHandler(args[1] as Response).error(
          new AppError({
            message: 'Failed validation error',
            data: validatedData.error.flatten().fieldErrors, // Use format() for user-friendly messages
            status_code: 422,
            success: false,
          })
        )
      }

      // Access validated data using validatedData.data
      return originalFunction.call(this, ...args, validatedData.data) // Pass validated data
    }
  }
}
