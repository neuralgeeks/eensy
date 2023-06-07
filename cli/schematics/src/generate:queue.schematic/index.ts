import { join } from 'path'

import { strings } from '@angular-devkit/core'
import {
  Rule,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  template,
  url,
} from '@angular-devkit/schematics'
import inquirer from 'inquirer'
import { plural, singular } from 'pluralize'

import { Schema } from './schema'

const identity = (x: string): string => x

export function generateQueue(_options: Schema): Rule {
  return async (tree: Tree) => {
    // Making sure the name is singular
    _options.name = singular(_options.name)

    // Getting services
    const services = tree.getDir(join('./', 'services')).subdirs

    if (services.length === 0)
      throw new SchematicsException(
        'You must have at least one service to generate a queue.'
      )

    // Picking service
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'service',
        message: 'Which service would you like your queue to be created?',
        choices: services,
      },
    ])

    const service = answers.service

    // Template source
    const sourceTemplates = url(`${__dirname}/.templates`)

    // Applying template
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        service,
        ..._options,
        ...strings,
        identity,
        plural,
      }),
    ])

    return chain([mergeWith(sourceParametrizedTemplates)])
  }
}
