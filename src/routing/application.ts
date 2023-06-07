import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

import { Application } from 'express'
import { plural } from 'pluralize'
import camelcase from 'to-camel-case'

export const applicationRoutes = async (
  app: Application,
  appsDirname: string
) => {
  const dirname = join(appsDirname, 'src', 'routes')
  if (!existsSync(dirname)) return

  const routesFilenames = readdirSync(dirname).filter(
    (filename) =>
      filename.endsWith('-routes.ts') || filename.endsWith('-routes.js')
  )

  for (const filename of routesFilenames) {
    const routesPreffix = plural(
      camelcase(
        filename.replace(/-routes\.ts$/, '').replace(/-routes\.js$/, '')
      )
    )

    const module = await import(join(dirname, filename))
    app.use(`/${routesPreffix}`, module.default)
  }
}
