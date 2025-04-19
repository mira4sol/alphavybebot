import { Application, Handler, Router } from 'express'
import { controllers } from './controllers'
import { applyParameterDecorators } from './decorators/ParameterDecorators'
import { ReflectMetadataKeys, Route } from './types/decorators.interface'

export const registerRoutes = (app: Application) => {
  const info: Array<{ api: string; handler: string }> = []

  controllers.forEach((controllerClass) => {
    const controllerInstance: { [handleName: string]: Handler } =
      new controllerClass() as any

    let basePath: string = Reflect.getMetadata(
      ReflectMetadataKeys.BASE_PATH,
      controllerClass
    )

    const expressRouter = Router()

    const controllerRoutes: Array<Route> = Reflect.getMetadata(
      ReflectMetadataKeys.ROUTES,
      controllerClass
    )

    controllerRoutes.forEach(({ method, path, handlerName, routeOptions }) => {
      // Apply parameter decorators to this route handler
      applyParameterDecorators(controllerInstance, String(handlerName))

      if (routeOptions?.version && routeOptions?.version !== '') {
        const childRouter = Router()[method](
          path,
          ...(routeOptions.handlers ?? []), // Adding middlewares or handlers
          controllerInstance[String(handlerName)].bind(controllerInstance)
        )
        const routeBasePath = basePath.replace(':version', routeOptions.version)
        app.use(routeBasePath, childRouter)
      } else {
        basePath = basePath.replace(':version', 'v1')
        expressRouter[method](
          path,
          ...(routeOptions?.handlers ?? []), // Adding middlewares or handlers
          controllerInstance[String(handlerName)].bind(controllerInstance)
        )
        app.use(basePath, expressRouter)
      }
      info.push({
        api: `${method.toLocaleUpperCase()} ${basePath + path}`,
        handler: `${controllerClass.name}.${String(handlerName)}`,
      })
    })
  })

  console.table(info)
}
