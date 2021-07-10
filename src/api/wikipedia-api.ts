import { fetch, Response } from '../utils'

const ENDPOINT_BASE_URL = 'https://ja.wikipedia.org/w/api.php'

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

export class WikipediaAPI {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

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
    return await this.fetcher<RandomPageResponseBody>(ENDPOINT_BASE_URL, params)
  }
}
