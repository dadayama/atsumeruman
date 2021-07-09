import nodeFetch from 'node-fetch'
import querySting from 'querystring'

export class FetchError extends Error {}

export class Response<T> {
  constructor(readonly status: number, readonly body: T) {}
}

export type Params = Record<string, string | number | boolean>
export type ResponseFormat = 'json' | 'text'

export const fetch = async <T = unknown>(
  uri: string,
  params?: Params,
  format: ResponseFormat = 'json'
): Promise<Response<T>> => {
  const _uri = params ? `${uri}?${querySting.stringify(params)}` : uri

  const res = await nodeFetch(_uri)
  const body = await (format === 'json' ? res.json() : res.text())

  return new Response(res.status, body as unknown as T)
}
