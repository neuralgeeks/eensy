/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { join } from 'path'

import { schema, tags } from '@angular-devkit/core'
import {
  UnsuccessfulWorkflowExecution,
  formats,
} from '@angular-devkit/schematics'
import {
  NodeWorkflow,
  NodeWorkflowOptions,
} from '@angular-devkit/schematics/tools'
import * as colors from 'ansi-colors'
import inquirer, { CheckboxQuestion, ListQuestion, Question } from 'inquirer'

import { createLogger } from './logger'
import { getCollection, getSchematic } from './tools'

export async function run(
  root: string,
  name: string,
  { debug = false, dryRun = false, force = false } = {},
  args = {}
): Promise<boolean> {
  const logger = createLogger('eensy.cli')

  try {
    let error = false
    let nothingDone = true
    const allowPrivateSchematics = true

    const options: NodeWorkflowOptions = {
      force: force,
      dryRun: dryRun,
      packageManager: 'npm',
      resolvePaths: [__dirname, process.cwd(), root],
      registry: new schema.CoreSchemaRegistry(formats.standardFormats),
      schemaValidation: true,
    }

    const _workflow = new NodeWorkflow(root, options)

    _workflow.registry.usePromptProvider((definitions) => {
      const questions = definitions.map((definition) => {
        const question: Question = {
          name: definition.id,
          message: definition.message,
          default: definition.default,
        }

        const validator = definition.validator
        if (validator) {
          question.validate = (input) => validator(input)

          // Filter allows transformation of the value prior to validation
          question.filter = async (input) => {
            for (const type of definition.propertyTypes) {
              let value
              switch (type) {
                case 'string':
                  value = String(input)
                  break
                case 'integer':
                case 'number':
                  value = Number(input)
                  break
                default:
                  value = input
                  break
              }

              // Can be a string if validation fails
              const isValid = (await validator(value)) === true
              if (isValid) return value
            }

            return input
          }
        }

        switch (definition.type) {
          case 'confirmation':
            question.type = 'confirm'
            break
          case 'list':
            {
              const listQuestion = question as ListQuestion | CheckboxQuestion

              listQuestion.type = definition.multiselect ? 'checkbox' : 'list'
              listQuestion.choices = definition.items?.map((item) =>
                typeof item === 'string'
                  ? item
                  : {
                      name: item.label,
                      value: item.value,
                    }
              )
            }
            break
          case 'input':
            question.type =
              definition.propertyTypes.size === 1 &&
              (definition.propertyTypes.has('number') ||
                definition.propertyTypes.has('integer'))
                ? 'number'
                : 'input'

            break
          default:
            question.type = definition.type
            break
        }

        return question
      })

      return inquirer.prompt(questions)
    })

    const collection = await getCollection(
      _workflow.engine,
      join(__dirname, '..', 'src', 'collection.json')
    )

    const schematic = getSchematic(collection, name, allowPrivateSchematics)
    const collectionName = schematic.collection.description.name
    const schematicName = schematic.description.name

    const input = { ...args }
    let loggingQueue: string[] = []

    _workflow.reporter.subscribe((event) => {
      nothingDone = false

      // Strip leading slash to prevent confusion.
      const eventPath = event.path.startsWith('/')
        ? event.path.substring(1)
        : event.path

      switch (event.kind) {
        case 'error':
          {
            error = true
            const desc =
              event.description == 'alreadyExist'
                ? 'already exists'
                : 'does not exist.'
            logger.warn(`ERROR! ${eventPath} ${desc}.`)
          }
          break
        case 'update':
          loggingQueue.push(tags.oneLine`
                ${colors.cyan('UPDATE')} ${eventPath} (${
            event.content.length
          } bytes)
              `)
          break
        case 'create':
          loggingQueue.push(tags.oneLine`
                ${colors.green('CREATE')} ${eventPath} (${
            event.content.length
          } bytes)
              `)
          break
        case 'delete':
          loggingQueue.push(`${colors.yellow('DELETE')} ${eventPath}`)
          break
        case 'rename':
          {
            const eventToPath = event.to.startsWith('/')
              ? event.to.substring(1)
              : event.to
            loggingQueue.push(
              `${colors.blue('RENAME')} ${eventPath} => ${eventToPath}`
            )
          }
          break
      }
    })

    _workflow.lifeCycle.subscribe((event) => {
      if (event.kind == 'end' || event.kind == 'post-tasks-start') {
        if (!error) {
          // Output the logging queue, no error happened.
          loggingQueue.forEach((log) => logger.info(log))
        }

        loggingQueue = []
        error = false
      }
    })

    const workflowPromise = new Promise<boolean>((resolve) => {
      _workflow
        .execute({
          collection: collectionName,
          schematic: schematicName,
          options: input,
          debug: debug,
          logger: logger,
          allowPrivate: allowPrivateSchematics,
        })
        .subscribe({
          error: (err) => {
            // In case the workflow was not successful, show an appropriate error message.
            if (err instanceof UnsuccessfulWorkflowExecution) {
              // "See above" because we already printed the error.
              logger.fatal('The Schematic workflow failed. See above.')
            } else if (debug)
              logger.fatal(`An error occured:\n${err.message}\n${err.stack}`)
            else logger.fatal(err.message)

            logger.complete()
            resolve(false)
          },
          complete: () => {
            if (nothingDone) logger.info('Nothing to be done.')

            if (dryRun)
              logger.warn(`The "dryRun" flag means no changes were made.`)

            logger.complete()
            resolve(!nothingDone)
          },
        })
    })

    return await workflowPromise
  } catch (e) {
    console.error(e)
    logger.fatal('fatal engine error')
    logger.complete()

    return false
  }
}
