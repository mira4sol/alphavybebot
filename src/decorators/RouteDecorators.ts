import {
  ReflectMetadataKeys,
  Route,
  RouteMethods,
  RouteOptions,
} from '@/types/decorators.interface'
import { ResponseHandler } from '@/utils/custom_error/response_handler'

/**
 * The `Controller` function in TypeScript is a decorator that sets the base path for a class
 * constructor.
 * @param {string} [path] - The `path` parameter in the `Controller` function is an optional string
 * parameter that specifies the base path for the controller. If provided, it will be used as the base
 * path for the routes defined within the controller. If not provided, the default base path `/` will
 * be used.
 * @returns A higher-order function is being returned. This function takes a constructor function as an
 * argument and sets metadata using Reflect.defineMetadata based on the provided path or a default path
 * if none is provided.
 */
export function Controller(path?: string) {
  const defaultPath = '/'

  return function (constructor: Function) {
    Reflect.defineMetadata(
      ReflectMetadataKeys.BASE_PATH,
      path ?? defaultPath,
      constructor
    )
  }
}

/**
 * The `methodDecoratorFactory` function creates a method decorator for defining routes in a controller
 * class.
 * @param {RouteMethods} method - RouteMethods is a type that represents the HTTP methods such as GET,
 * POST, PUT, DELETE, etc. It is used to specify the type of HTTP method for a route in a web
 * application.
 * @returns The `methodDecoratorFactory` function returns a method decorator function.
 */
const methodDecoratorFactory = (method: RouteMethods) => {
  return (path: string, options?: RouteOptions): MethodDecorator => {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
      const controllerClass = target.constructor
      // Create the path of each route in the controller and store them in an array
      const routers: Array<Route> = Reflect.hasMetadata(
        ReflectMetadataKeys.ROUTES,
        controllerClass
      )
        ? Reflect.getMetadata(ReflectMetadataKeys.ROUTES, controllerClass)
        : []
      routers.push({
        method,
        path,
        handlerName: propertyKey,
        routeOptions: options,
      })
      Reflect.defineMetadata(
        ReflectMetadataKeys.ROUTES,
        routers,
        controllerClass
      )

      Route(target, propertyKey, descriptor, options)
    }
  }
}

/**
 * The Route decorator function in TypeScript handles asynchronous route functions with response
 * handling options.
 * @param {unknown} target - The `target` parameter in the `Route` function represents the object on
 * which the method is being called. It could be an instance of a class or the prototype of a class if
 * the method is static.
 * @param {string | symbol} propertyKey - The `propertyKey` parameter in the `Route` function
 * represents the key of the property being decorated. It can be either a string or a symbol, depending
 * on the property key used in the class. This parameter is used to identify the property to which the
 * decorator is being applied.
 * @param {PropertyDescriptor} descriptor - The `descriptor` parameter in the `Route` function is a
 * PropertyDescriptor object that represents the property descriptor of the target function. It
 * contains information about the property being defined or modified, such as its value, writable,
 * enumerable, and configurable attributes. In the provided code snippet, the `descriptor`
 * @param {RouteOptions} [options] - The `options` parameter in the `Route` function is an optional
 * parameter of type `RouteOptions`. It allows you to provide additional configuration options for the
 * route. In the code snippet you provided, the `options` parameter is used to customize the behavior
 * of the route, such as handling the response
 * @returns In the provided `Route` function decorator, the return value depends on the conditions
 * within the function. Here is a breakdown of the possible return values based on the conditions:
 */
function Route(
  target: unknown,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  options?: RouteOptions
) {
  const originalFunction = descriptor.value
  descriptor.value = async function (...args: Array<unknown>) {
    const response = args[1] as Response
    try {
      const data = await originalFunction.call(this, ...args)
      if (options) {
        if (options.handleResponse != null && options.handleResponse) {
          return
        }
      }
      return new ResponseHandler(response as any).success({
        data: data,
        message: 'Success',
      })
    } catch (e) {
      return new ResponseHandler(response as any).error(e as any)
    }
  }
}

export const Get = methodDecoratorFactory(RouteMethods.GET)
export const Post = methodDecoratorFactory(RouteMethods.POST)
export const Patch = methodDecoratorFactory(RouteMethods.PATCH)
export const Delete = methodDecoratorFactory(RouteMethods.DELETE)
export const Options = methodDecoratorFactory(RouteMethods.OPTIONS)
