import { fetch, FetchError } from '../utils'

const ENDPOINT_BASE_URL = 'https://ja.wikipedia.org/w/api.php'

export class Page {
  constructor(readonly title: string, readonly url: string) {}
}

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

  async fetchRandomPage(): Promise<Page> {
    const params = {
      format: 'json',
      action: 'query',
      generator: 'random',
      grnnamespace: 0,
      prop: 'info',
      inprop: 'url',
      indexpageids: true,
    }
    const res = await this.fetcher<RandomPageResponseBody>(ENDPOINT_BASE_URL, params, 'json')

    if (res.status >= 400) {
      throw new FetchError('Failed to fetch the random Wikipedia page.')
    }

    const {
      query: { pageids: pageIds, pages },
    } = res.body
    const page = pages[pageIds[0]]

    return new Page(page.title, page.fullurl)
  }
}
