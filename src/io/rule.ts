import Logger from '../utils/logger'
import { data } from '../utils/types'

const logger = new Logger()

export default abstract class Rule {
  name = 'Generic Rule'
  debug = false

  async eval(data: data): Promise<boolean> {
    try {
      const body = await this.body(data)
      if (this.debug) {
        logger.debug(`${this.name} body evaluation returned: `)
        logger.debug(body)
      }

      const result = await this.predicate(body)
      if (this.debug) logger.debug(`${this.name} evaluation returned ${result}`)

      return result
    } catch (e) {
      if (this.debug) {
        logger.debug(`Exception raised while evaluating ${this.name}`)
        logger.debug(e)
        logger.debug(`${this.name} evaluation returned false`)
      }
      return false
    }
  }

  /**
   * Parses the body of the rule from a data object.
   *
   * The output of this method will be used to evaluate the rule predicate.
   * If this method throws an error, the body gets invalidated and thus the rule predicate.
   */
  protected abstract body(data: data): Promise<data>

  /**
   * The predicate that defines the rule.
   *
   * If this method throws an error or returns `false` the rule gets invalidated.
   */
  protected abstract predicate(data: data): Promise<boolean>
}
