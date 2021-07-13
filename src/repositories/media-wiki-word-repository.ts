import { MediaWikiAPI } from '../api'
import { Word } from '../vo'
import { WordRepository, WordRepositoryHandleError } from './word-repository'

export class MediaWikiWordRepository implements WordRepository {
  constructor(private readonly client: MediaWikiAPI) {}

  async getRandomly(): Promise<Word> {
    try {
      const res = await this.client.fetchRandomPage()

      if (res.status >= 400) {
        throw new WordRepositoryHandleError('Failed to get the random word.')
      }

      const {
        query: { pageids: pageIds, pages },
      } = res.body
      const pageId = pageIds[0]
      const page = pages[pageId]

      return new Word(page.title, page.fullurl)
    } catch (e) {
      throw new WordRepositoryHandleError(e?.message || 'An error occurred when fetching the data.')
    }
  }
}
