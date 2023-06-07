import Logger from '../utils/logger'
import { data } from '../utils/types'

const logger = new Logger()

export abstract class _2pcJobProcessor {
  queueName: string

  constructor(queueName: string) {
    this.queueName = queueName
  }

  abstract requiredLocks(id: string | number, data: data): string[]
  abstract prepare(id: string | number, validated: data): Promise<unknown>[]
  abstract commit(id: string | number, validated: data): Promise<unknown>[]
  abstract rollback(id: string | number, validated: data): Promise<unknown>[]

  /**
   * Called when a job starts getting processed.
   */
  async onJobBegins(id: string | number) {
    logger.info(`${this.queueName} job ${id} started`)
  }

  /**
   * Called when validator rejects the job.
   */
  async onValidationError(id: string | number, data: data, e: unknown) {
    logger.error(`${this.queueName} job ${id} validation rejected`, e)
  }

  /**
   * Called when an error occurs during the rollback step of 2pc
   */
  async onRollbackError(id: string | number, validated: data, e: unknown) {
    logger.error(`${this.queueName} job ${id} rollback error`, e)
  }

  /**
   * Called when an error occurs during the prepare-commit step of 2pc
   */
  async onTransactionError(id: string | number, validated: data, e: unknown) {
    logger.error(`${this.queueName} job ${id} transaction error`, e)
  }

  /**
   * Called when an error occurs and marks the job as delayed.
   */
  async onJobFailed(id: string | number, data: data, e: unknown) {
    logger.error(
      `${this.queueName} job ${id} failed, job has remaning attemps, delaying`,
      e
    )
  }

  /**
   * Called when job completes succesfully. This is, it gets resolved with no validation errors.
   */
  async onTransactionSuccess(id: string | number, validated: data) {
    logger.info(`${this.queueName} job ${id} success`, validated)
  }

  /**
   * Called when job completely fails. This is, it has no remaining attemps.
   */
  async onJobCompletelyFailed(id: string | number, validated: data) {
    logger.error(
      `${this.queueName} job ${id} has no remaining attemps, job failed.`,
      validated
    )
  }
}

export abstract class _2pcJobValidator {
  abstract requiredLocks(data: data): string[]

  abstract validate(data: data): Promise<data>
}
