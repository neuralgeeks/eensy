import { data } from '../utils/types'

export default abstract class Identifier {
  /**
   * Parses the body of the identifier from a data object.
   * The output of this method will be used to resolve the client identity.
   */
  protected abstract body(data: data): Promise<data>

  /**
   * Returns the assigned identifier of a client given it's body.
   */
  protected abstract identify(body: data): Promise<string | number>

  async resolveIdentity(data: data) {
    const body = await this.body(data)
    return this.identify(body)
  }
}
