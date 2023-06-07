import { HTTPService } from 'eensy/src/io/http-service'

export default class <%= classify(name) %>Service extends HTTPService {
  constructor() {
    super('<%= dasherize(name) %>-service', '<service-url>')
  }

  async getHeaders() {
    return {}
  }
}
