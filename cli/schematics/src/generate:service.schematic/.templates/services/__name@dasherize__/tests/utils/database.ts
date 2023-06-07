import { exec } from 'child_process'

import { env } from '@env'

export function resetDatabase(verbose = false) {
  return new Promise<void>((resolve, reject) => {
    const commands = [
      `NODE_ENV=${env} npx prisma migrate reset --force`,
      `NODE_ENV=${env} ts-node prisma/seeders`,
    ]

    exec(commands.join(' && '), { env: process.env }, (error, stdout) => {
      if (error) {
        console.log(error)
        console.log(stdout)
        reject(error)
        return
      }

      if (verbose) console.log(stdout)
      resolve()
    })
  })
}
