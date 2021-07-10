import nodeFetch from 'node-fetch'
import querySting from 'querystring'

export type Query = Record<string, string | number | boolean>
export type ResponseFormat = 'json' | 'text'
export type RequestOptions = {
  responseFormat?: ResponseFormat
}

export class Response<T> {
  constructor(readonly status: number, readonly body: T) {}
}

export const fetch = async <T = unknown>(
  uri: string,
  query?: Query,
  options: RequestOptions = {}
): Promise<Response<T>> => {
  const _uri = query ? `${uri}?${querySting.stringify(query)}` : uri

  const res = await nodeFetch(_uri)
  const format = options?.responseFormat || 'json'
  const body = await (format === 'json' ? res.json() : res.text())

  return new Response(res.status, body as unknown as T)
}
