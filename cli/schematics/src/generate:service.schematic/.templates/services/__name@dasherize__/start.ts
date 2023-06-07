import { fork } from 'child_process'
import { join } from 'path'

import environment from '@env'

const { name, port } = environment.start

const child = fork(join(__dirname, 'app'), [name, port, 'true'], {
  silent: true,
  stdio: 'inherit',
})

child.on('error', (error) =>
  console.log(`${name} process error: ${error.message}`)
)

child.on('close', (code) => {
  if (code !== 0) console.log(`${name} process exited with code ${code}`)
})
