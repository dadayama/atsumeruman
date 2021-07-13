import { MediaWikiAPI } from '../api'
import { Topic } from '../vo'
import { TopicRepository, TopicRepositoryHandleError } from './topic-repository'

export class MediaWikiWordRepository implements TopicRepository {
  constructor(private readonly client: MediaWikiAPI) {}

  async getRandomly(): Promise<Topic> {
    try {
      const res = await this.client.fetchRandomPage()

      if (res.status >= 400) {
        throw new TopicRepositoryHandleError('Failed to get the random word.')
      }

      const {
        query: { pageids: pageIds, pages },
      } = res.body
      const pageId = pageIds[0]
      const page = pages[pageId]

      return new Topic(page.title, page.fullurl)
    } catch (e) {
      throw new TopicRepositoryHandleError(
        e?.message || 'An error occurred when fetching the data.'
      )
    }
  }
}
