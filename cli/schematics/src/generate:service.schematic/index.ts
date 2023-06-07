import { join } from 'path'

import { strings } from '@angular-devkit/core'
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  template,
  url,
} from '@angular-devkit/schematics'
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks'
import * as prettier from 'prettier'

import { Schema } from './schema'

export function generateService(_options: Schema): Rule {
  return (tree: Tree) => {
    // Validate that given service exists
    if (
      tree.exists(join('./', 'services', `${strings.dasherize(_options.name)}`))
    ) {
      throw new SchematicsException('Service already exist')
    }

    // Template source
    const sourceTemplates = url(`${__dirname}/.templates`)

    // Applying template
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings,
      }),
    ])

    return chain([
      mergeWith(sourceParametrizedTemplates),
      addServiceToVsConfig(_options),
      npmInstall(_options),
    ])
  }
}

function addServiceToVsConfig(_options: Schema): Rule {
  return (tree: Tree) => {
    // Reading .vscode/settings.json
    const settingsJSONBuffer = tree.read(join('./', '.vscode', 'settings.json'))
    if (!settingsJSONBuffer)
      throw new SchematicsException(
        "Failed to read project's .vscode/settings.json"
      )

    const settings = JSON.parse(settingsJSONBuffer.toString())

    // Adding the new service
    settings['eslint.workingDirectories'].push({
      directory: join('./', 'services', `${strings.dasherize(_options.name)}`),
      changeProcessCWD: true,
    })

    // Updating the .vscode/settings.json
    tree.overwrite(
      join('./', '.vscode', 'settings.json'),
      prettier.format(JSON.stringify(settings), { parser: 'json' })
    )
  }
}

function npmInstall(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.addTask(
      new NodePackageInstallTask({
        workingDirectory: `${_options.scope ? _options.scope : '.'}/`,
      })
    )
    return tree
  }
}
