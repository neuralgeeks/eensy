import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import * as R from 'ramda'
import { z } from 'zod'

import { HttpMethod } from '../routing/method'
import { data, record } from '../utils/types'

const EensyAPIErrorSchema = z.object({
  error: z
    .object({
      status: z.number(),
      title: z.string(),
      detail: z.string().optional(),
      meta: z.any(),
    })
    .passthrough(),
})

const HTTPServiceErrorHandler =
  (service: string, route: string) => (error: AxiosError) => {
    // Case: The service returned a non 2XX code
    if (error.response) {
      const parsedErr = EensyAPIErrorSchema.safeParse(error.response.data)

      // Case: Response is not EensyAPI-like
      if (!parsedErr.success)
        throw {
          status: error.response.status,
          title: 'serviceRequestError',
          detail: `${service} returned an error when calling ${route}`,
          meta: {
            originalError: error.response.data,
            serviceScope: [{ service, route }],
          },
        }

      // Case: Response is EensyAPI-like
      const APIErrorFeed = parsedErr.data.error
      APIErrorFeed.meta = APIErrorFeed.meta || {}

      APIErrorFeed.meta = {
        ...APIErrorFeed.meta,
        serviceScope: [
          ...(APIErrorFeed.meta.serviceScope || []),
          { service, route },
        ],
      }

      throw APIErrorFeed
    }
    // Case: The service did not responded
    else if (error.request)
      throw {
        status: 500,
        title: 'serviceRequestError',
        detail: `${service} did not responded at ${route} request.`,
        meta: { serviceScope: [{ service, route }] },
      }
    // Case: Unexpected error
    else
      throw {
        status: 500,
        title: 'serviceRequestError',
        detail: `Something happened while setting up ${service} ${route} request.`,
        meta: { serviceScope: [{ service, route }], message: error.message },
      }
  }

export class HTTPService {
  name: string
  url: string

  constructor(name: string, url: string) {
    this.name = name
    this.url = url
  }

  async getHeaders(): Promise<record> {
    return {}
  }

  async method(
    method: HttpMethod,
    route: string,
    options: AxiosRequestConfig = {}
  ) {
    return axios({
      method,
      url: `${this.url}${route}`,
      headers: await this.getHeaders(),
      ...R.omit(['method', 'url'], options),
    }).catch(HTTPServiceErrorHandler(this.name, route))
  }

  async post(route: string, data: data, options: AxiosRequestConfig = {}) {
    return this.method('post', route, { ...options, data })
  }

  async get(route: string, options: AxiosRequestConfig = {}) {
    return this.method('get', route, options)
  }

  async put(route: string, data: data, options: AxiosRequestConfig = {}) {
    return this.method('post', route, { ...options, data })
  }

  async patch(route: string, data: data, options: AxiosRequestConfig = {}) {
    return this.method('patch', route, { ...options, data })
  }

  async delete(
    route: string,
    data: data = {},
    options: AxiosRequestConfig = {}
  ) {
    return this.method('delete', route, { ...options, data })
  }
}
