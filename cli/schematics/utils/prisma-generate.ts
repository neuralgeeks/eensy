import { exec } from 'child_process'

export function prismaGenerate(verbose = false) {
  return new Promise<void>((resolve, reject) => {
    const command = 'npm run prisma-generate --workspaces --if-present'

    exec(command, { env: process.env }, (error, stdout) => {
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
