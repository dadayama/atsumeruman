import { fetch } from '../utils'
import { MediaWikiAPI } from './media-wiki-api'

const BASE_URL = 'https://ja.uncyclopedia.info/api.php'

export class UnCyclopediaAPI extends MediaWikiAPI {
  constructor(fetcher: typeof fetch = fetch) {
    super(BASE_URL, fetcher)
  }
}
