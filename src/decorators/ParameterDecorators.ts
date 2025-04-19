import { ReflectMetadataKeys } from '@/types/decorators.interface'
import { Request } from 'express'

// Define our own parameter decorator type to fix the type issue
type CustomParameterDecorator = (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) => void

/**
 * Creates a parameter decorator factory that extracts specific data from the request
 * @param extractor Function that extracts data from the request
 * @returns A parameter decorator
 */
function createParameterDecorator(
  extractor: (req: Request) => any
): CustomParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    // Get existing parameter decorators or initialize empty array
    const existingDecorators: Array<{
      index: number
      extractor: (req: Request) => any
    }> =
      Reflect.getMetadata(ReflectMetadataKeys.PARAMS, target, propertyKey) || []

    // Add this decorator
    existingDecorators.push({
      index: parameterIndex,
      extractor,
    })

    // Store metadata
    Reflect.defineMetadata(
      ReflectMetadataKeys.PARAMS,
      existingDecorators,
      target,
      propertyKey
    )

    // We'll handle method replacement at route registration time instead of here
    // This avoids the infinite recursion problem
  }
}

/**
 * Helper function to be called during route registration to apply parameter decorators
 * @param target The class instance
 * @param propertyKey The method name
 */
export function applyParameterDecorators(
  target: any,
  propertyKey: string | symbol
) {
  if (
    Reflect.hasMetadata(
      ReflectMetadataKeys.PARAMS,
      target.constructor.prototype,
      propertyKey
    )
  ) {
    const originalMethod = target[propertyKey]

    if (typeof originalMethod !== 'function') return

    const paramDecorators =
      Reflect.getMetadata(
        ReflectMetadataKeys.PARAMS,
        target.constructor.prototype,
        propertyKey
      ) || []

    // Create a wrapper method that processes the parameters
    target[propertyKey] = function (req: Request, ...rest: any[]) {
      const args: any[] = [req, ...rest]

      // Apply parameter decorators
      for (const decorator of paramDecorators) {
        args[decorator.index] = decorator.extractor(req)
      }

      return originalMethod.apply(this, args)
    }
  }
}

/**
 * Decorator to inject request parameters
 * @param paramName Optional parameter name to extract, if not provided returns all params
 */
export const Param = (paramName?: string) =>
  createParameterDecorator((req: Request) =>
    paramName ? req.params[paramName] : req.params
  )

/**
 * Decorator to inject the entire request object
 */
export const Req = createParameterDecorator((req: Request) => req)

/**
 * Decorator to inject the response object
 */
export const Res = createParameterDecorator((req: Request) => {
  // Response is typically the second argument in Express middleware
  return (req as any).res
})

/**
 * Decorator to inject request body
 * @param propName Optional property name to extract from body, if not provided returns entire body
 */
export const Body = (propName?: string) =>
  createParameterDecorator((req: Request) =>
    propName ? req.body[propName] : req.body
  )

/**
 * Decorator to inject request query parameters
 * @param queryName Optional query parameter name to extract, if not provided returns all query params
 */
export const Query = (queryName?: string) =>
  createParameterDecorator((req: Request) =>
    queryName ? req.query[queryName] : req.query
  )

/**
 * Decorator to inject request headers
 * @param headerName Optional header name to extract, if not provided returns all headers
 */
export const Headers = (headerName?: string) =>
  createParameterDecorator((req: Request) =>
    headerName ? req.headers[headerName.toLowerCase()] : req.headers
  )
