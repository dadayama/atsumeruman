import { injectable } from 'inversify'
import { TrendRepository } from './trend-repository'
import { TopicRepositoryHandleError } from './topic-repository'
import { TwitterAPI, TrendsResponseBody } from '../api'
import { Topic } from '../vo'
import { Response } from '../utils'

@injectable()
export class TwitterTrendRepository implements TrendRepository {
  constructor(private readonly client: TwitterAPI) {}

  async getRandomly(): Promise<Topic> {
    try {
      const res = await this.client.fetchTrends()
      const trend = this.pickTrendRandomlyFromResponse(res)

      return new Topic(trend.name, trend.url)
    } catch (e) {
      throw new TopicRepositoryHandleError(
        e?.message || 'An error occurred when fetching the data.'
      )
    }
  }

  private pickTrendRandomlyFromResponse(
    res: Response<TrendsResponseBody>
  ): TrendsResponseBody[number]['trends'][number] {
    const trends = res.body[0].trends
    const index = Math.floor(Math.random() * trends.length)
    return trends[index]
  }
}
