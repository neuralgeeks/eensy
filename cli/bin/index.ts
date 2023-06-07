import * as colors from 'ansi-colors'
import { Command } from 'commander'
import { textSync } from 'figlet'

import { run } from '../schematics/API/engine'
import { prismaGenerate } from '../schematics/utils/prisma-generate'

const program = new Command()
const path = process.cwd()

program
  .command('init')
  .description('inits an eensy project.')
  .action(async () => {
    await run(path, 'init')
  })

program
  .command('generate:service')
  .description('generates a service inside an eensy project.')
  .action(async () => {
    await run(path, 'generate-service')
  })

program
  .command('generate:resource')
  .description('generates a Restful resource inside an eensy service.')
  .action(async () => {
    const changed = await run(path, 'generate-resource')
    if (changed) {
      console.info(`> Running prisma generate ${colors.white.bold('')}`)
      await prismaGenerate()
      console.info(
        `${colors.green.bold('✔')} All prisma clients have been generated\n`
      )
    }
  })

program
  .command('generate:service-interface')
  .description('generates a new service interface inside an eensy service.')
  .action(async () => {
    await run(path, 'generate-service-interface')
  })

program
  .command('generate:queue')
  .description('generates a new queue inside an eensy service.')
  .action(async () => {
    await run(path, 'generate-queue')
  })

console.log(
  colors.cyan(
    textSync('eensy.cli', { font: 'ANSI Shadow', horizontalLayout: 'full' })
  )
)

program.parse(process.argv)
