import { join } from 'path'

import { strings } from '@angular-devkit/core'
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics'

import { Schema } from './schema'

export function generateModel(_options: Schema): Rule {
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

    // Adding model to service's schema.prisma
    const servicePrismaSchema = tree.read(
      join('./', 'services', _options.service, 'prisma', 'schema.prisma')
    )

    if (!servicePrismaSchema)
      throw new SchematicsException('Service does not have a schema.prisma')

    const modelString = [
      '',
      '',
      `model ${strings.classify(_options.name)} {`,
      '  id        String   @id @default(uuid())',
      '  createdAt DateTime @default(now())',
      '  updatedAt DateTime @updatedAt',
      '}',
    ].join('\n')

    tree.overwrite(
      join('./', 'services', _options.service, 'prisma', 'schema.prisma'),
      servicePrismaSchema.toString().concat(modelString)
    )
  }
}
