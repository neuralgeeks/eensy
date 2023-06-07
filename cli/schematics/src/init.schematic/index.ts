import { normalize, strings } from '@angular-devkit/core'
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyToSubtree,
  chain,
  mergeWith,
  template,
  url,
} from '@angular-devkit/schematics'

import { Schema } from './schema'
import { generateService } from '../generate:service.schematic/index'

export function init(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Template source
    const sourceTemplates = url(`${__dirname}/.templates`)

    // Applying template
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings,
      }),
    ])

    // Base rules, merging the template
    const rules: [Rule] = [mergeWith(sourceParametrizedTemplates)]

    // Generation the API service if wanted
    if (_options.shouldGenerateService) {
      // Generate service using 'generate-service' schematic
      rules.push(
        applyToSubtree(normalize(`./${strings.dasherize(_options.name)}`), [
          generateService({
            name: 'api',
            scope: `./${strings.dasherize(_options.name)}`,
            port: 3111,
          }),
        ])
      )
    }

    // Return the chain of all rules
    return chain(rules)(tree, _context)
  }
}
