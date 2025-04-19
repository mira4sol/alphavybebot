import { RequestHandler } from 'express'

export enum RouteMethods {
  GET = 'get',
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete',
  OPTIONS = 'options',
}

export interface Route {
  method: RouteMethods
  path: string
  handlerName: string | symbol
  routeOptions?: RouteOptions
}

export enum ReflectMetadataKeys {
  BASE_PATH = 'base_path',
  ROUTES = 'routes',
  PARAMS = 'parameters',
  PARAM_INJECTED = 'parameter_injected',
}

export interface RouteOptions {
  /**
   * If set to true then it means the function triggering the decorator will handle the response
   * else if its false it means the decorator will handle sending response back to the client
   */
  handleResponse?: boolean
  version?: string
  /** Handlers are just route middleware */
  handlers?: Array<RequestHandler>
  deprecated?: {
    replacedBy: string
    information?: string
  }
}

export enum ParameterType {
  REQUEST,
  RESPONSE,
  PARAMS,
  QUERY,
  BODY,
  HEADERS,
  COOKIES,
  NEXT,
}

/**
 * Cached(meta) parameter configuration
 *
 * @export
 * @interface ParameterConfiguration
 */
export interface ParameterConfiguration {
  index: number
  type: ParameterType
  name?: string
  data?: any
}
