import { fetch, Response } from '../utils'

export type RandomPageResponseBody = {
  query: {
    pageids: number[]
    pages: {
      [key: number]: {
        title: string
        fullurl: string
      }
    }
  }
}

export class MediaWikiAPI {
  constructor(private readonly baseUrl: string, private readonly fetcher: typeof fetch = fetch) {}

  async fetchRandomPage(): Promise<Response<RandomPageResponseBody>> {
    const params = {
      format: 'json',
      action: 'query',
      generator: 'random',
      grnnamespace: 0,
      prop: 'info',
      inprop: 'url',
      indexpageids: true,
    }
    return await this.fetcher<RandomPageResponseBody>(this.baseUrl, params)
  }
}
