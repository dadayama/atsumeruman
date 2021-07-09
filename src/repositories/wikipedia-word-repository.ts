import { WikipediaAPI } from '../api'
import { Word } from '../entities'
import { WordRepository, WordRepositoryHandleError } from './word-repository'

export class WikipediaWordRepository implements WordRepository {
  constructor(private readonly client: WikipediaAPI = new WikipediaAPI()) {}

  async getRandomly(): Promise<Word> {
    try {
      const page = await this.client.fetchRandomPage()
      return new Word(page.title, page.url)
    } catch (e) {
      throw new WordRepositoryHandleError(e?.message || 'Failed to get the random word.')
    }
  }
}
