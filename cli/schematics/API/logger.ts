/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { logging } from '@angular-devkit/core'
import * as colors from 'ansi-colors'
import { lastValueFrom, toArray } from 'rxjs'

export function createLogger(name: string) {
  const logger = new logging.Logger(name)

  lastValueFrom(logger.pipe(toArray())).then((observed) => {
    observed?.forEach((log) => {
      switch (log.level) {
        case 'debug':
          console.log(`${colors.bgCyan(colors.black('DEBUG'))}`, log.message)
          break
        case 'error':
          console.log(
            `${colors.bgRed(colors.bold('ERROR'))}`,
            `${colors.red(colors.bold(log.message))}`
          )
          break
        case 'fatal':
          console.log(
            `${colors.bgRedBright(colors.bold('FATAL'))}`,
            `${colors.redBright(colors.bold(log.message))}`
          )
          break
        case 'info':
          console.log(log.message)
          break
        case 'warn':
          console.log(
            `${colors.bgYellowBright(colors.black('WARN'))}`,
            log.message
          )
          break
      }
    })
  })

  return logger
}
