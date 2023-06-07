import { join } from 'path'

import {
  Rule,
  SchematicsException,
  Tree,
  chain,
} from '@angular-devkit/schematics'
import inquirer from 'inquirer'
import { singular } from 'pluralize'

import { GranulatedElements, Schema } from './schema'
import { generateController } from '../generate:controller.schematic/index'
import { generateModel } from '../generate:model.schematic/index'
import { generateRepository } from '../generate:repository.schematic/index'
import { generateTestingSpecs } from '../generate:resource-testing-specs.schematic/index'
import { generateRoutes } from '../generate:routes.schematic/index'
import { generateTransform } from '../generate:transform.schematic/index'
import { generateValidators } from '../generate:validators.schematic/index'

export function generateResource(_options: Schema): Rule {
  return (tree: Tree) => {
    return async (): Promise<Rule> => {
      // Making sure the name is singular
      _options.name = singular(_options.name)

      // Getting services
      const services = tree.getDir(join('./', 'services')).subdirs

      if (services.length === 0)
        throw new SchematicsException(
          'You must have at least one service to generate a resource.'
        )

      // Picking service
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'service',
          message: 'Which service would you like your resource to be created?',
          choices: services,
        },
      ])

      const service = answers.service

      // Picking elements to be generated
      const elementsAnswers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'granulatedElementsSelection',
          message:
            'Which elements would you like to be generated with the resource?',
          choices: [
            'Controller',
            'Model',
            'Repository',
            'REST Validators',
            'Routes',
            'Transformer',
            'Testing specs',
          ].map((value) => {
            return { value: value, checked: true }
          }),
        },
      ])

      const isSelected = (element: GranulatedElements): boolean => {
        return elementsAnswers.granulatedElementsSelection.includes(element)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ruleFactories: ((_options: any) => Rule)[] = []

      // Generate controller
      if (isSelected('Controller')) ruleFactories.push(generateController)

      // Generate model
      if (isSelected('Model')) ruleFactories.push(generateModel)

      // Generate reporitory
      if (isSelected('Repository')) ruleFactories.push(generateRepository)

      // Generate rest validator
      if (isSelected('REST Validators')) ruleFactories.push(generateValidators)

      // Generate routes
      if (isSelected('Routes')) ruleFactories.push(generateRoutes)

      // Generate transform
      if (isSelected('Transformer')) ruleFactories.push(generateTransform)

      // Generate testing specs
      if (isSelected('Testing specs')) ruleFactories.push(generateTestingSpecs)

      return chain(
        ruleFactories.map((factory) =>
          factory({ ..._options, service: service })
        )
      )
    }
  }
}
