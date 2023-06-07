import { run } from './schematics/API/engine'

const command = 'generate-resource'

run(
  `${__dirname}/.gen/${(command as string) === 'init' ? '' : 'project'}`,
  command,
  { debug: true }
)
