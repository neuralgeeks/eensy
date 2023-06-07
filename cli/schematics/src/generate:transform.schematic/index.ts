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
import { plural } from 'pluralize'

import { Schema } from './schema'

const identity = (x: string): string => x

export function generateTransform(_options: Schema): Rule {
  return (tree: Tree) => {
    // Validate that given service exists
    if (
      !tree
        .getDir(join('./', 'services'))
        .subdirs.map((item) => item.toString())
        .includes(_options.service)
    ) {
      throw new SchematicsException('Given service does not exist')
    }

    // Template source
    const sourceTemplates = url(`${__dirname}/.templates`)

    // Applying template
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings,
        identity,
        plural,
      }),
    ])

    return chain([mergeWith(sourceParametrizedTemplates)])
  }
}
