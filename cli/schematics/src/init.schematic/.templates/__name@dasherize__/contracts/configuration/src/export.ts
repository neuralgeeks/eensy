import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import * as prettier from 'prettier'
import { createClient } from 'redis'
import * as ts from 'typescript'

import { properties } from './properties'
import environment from '../environment'

const {
  redis: { host, port },
  hashname,
  dependantServices,
} = environment

const client = createClient({
  url: `redis://${host}:${port}`,
})
client.on('error', (err) => console.log('Redis Client Error', err))

async function main() {
  //------------ exporting properties to redis

  await client.connect()

  for (const key in properties) {
    console.log(`exporting: ${key}`)
    await client.hSet(
      hashname,
      key,
      JSON.stringify(properties[key as keyof typeof properties])
    )
  }

  await client.disconnect()

  //------------ exporting properties type for development
  const program = ts.createProgram([join(__dirname, 'properties.ts')], {})
  const sourceFile = program.getSourceFile(join(__dirname, 'properties.ts'))
  if (sourceFile) {
    const checker = program.getTypeChecker()
    const [syntaxList] = sourceFile.getChildren()
    const [child] = syntaxList.getChildren()

    const node = child.getChildren()[1].getChildren()[1].getChildren()[0]

    const type = checker.getTypeAtLocation(node)
    const typestr = checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation
    )

    const exportedTypeBuffer = prettier.format(
      `export type Properties = ${typestr}; \n\nexport const hashname = '${hashname}'`,
      {
        trailingComma: 'none',
        parser: 'typescript',
        tabWidth: 2,
        semi: false,
        singleQuote: true,
      }
    )
    writeFileSync(join(__dirname, 'properties.type.ts'), exportedTypeBuffer, {
      flag: 'w',
    })

    // Copy properties.type.ts and cluster-configuration to dependant services
    const exportedClusterConfigurationBuffer = readFileSync(
      join(__dirname, 'cluster-configuration.ts')
    )

    for (const service of dependantServices) {
      const folder = join(
        __dirname,
        '..',
        '..',
        '..',
        'services',
        service,
        'contracts',
        'configuration'
      )

      // create folder if not exists
      if (!existsSync(folder)) mkdirSync(folder, { recursive: true })

      // copy properties.type.ts
      writeFileSync(join(folder, 'properties.type.ts'), exportedTypeBuffer, {
        flag: 'w',
      })

      // copy cluster-configuration.ts
      writeFileSync(
        join(folder, 'cluster-configuration.ts'),
        exportedClusterConfigurationBuffer,
        {
          flag: 'w',
        }
      )
    }
  } else console.error('failed to locate compiler source file')
}

main()
