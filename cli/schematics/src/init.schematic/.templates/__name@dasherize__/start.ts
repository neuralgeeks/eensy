import { fork } from 'child_process'
import { existsSync, lstatSync, readdirSync } from 'fs'
import { join } from 'path'

// find the -s flag index
const includeIndex = process.argv.findIndex((arg) => arg === '-s')
const included = includeIndex !== -1 ? process.argv.slice(includeIndex + 1) : []

// find the -e flag index
const excludeIndex = process.argv.findIndex((arg) => arg === '-e')
const excluded = excludeIndex !== -1 ? process.argv.slice(excludeIndex + 1) : []

// get all directories in services/
const services = readdirSync(join(__dirname, 'services')).filter(
  (dir: string) =>
    lstatSync(join(__dirname, 'services', dir)).isDirectory() &&
    existsSync(join(__dirname, 'services', dir, 'start.ts')) &&
    (included.length === 0 || included.includes(dir)) &&
    !excluded.includes(dir)
)

// start each service
for (const service of services) {
  const child = fork(join(__dirname, 'services', service, 'start.ts'), [], {
    silent: true,
    stdio: 'inherit',
    execArgv: [...process.execArgv, '-r', 'tsconfig-paths/register'],
    cwd: join(__dirname, 'services', service),
  })

  child.on('error', (error) =>
    console.log(`${service} process error: ${error.message}`)
  )

  child.on('close', (code) => {
    if (code !== 0) console.log(`${service} process exited with code ${code}`)
  })
}
