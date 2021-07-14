import { injectable } from 'inversify'
import 'reflect-metadata'
import { Topic } from '../vo'
import {
  TopicRepository,
  SeriousWordRepository,
  FoolishWordRepository,
  TrendRepository,
} from '../repositories'
import * as di from '../di'

/**
 * 雑談のネタを取り扱う
 */
@injectable()
export class ChatTopicCollector {
  private readonly seriousWordRepository: SeriousWordRepository
  private readonly foolishWordRepository: FoolishWordRepository
  private readonly trendRepository: TrendRepository

  constructor() {
    this.seriousWordRepository = di.container.get<SeriousWordRepository>(
      di.TYPES.SeriousWordRepository
    )
    this.foolishWordRepository = di.container.get<FoolishWordRepository>(
      di.TYPES.FoolishWordRepository
    )
    this.trendRepository = di.container.get<TrendRepository>(di.TYPES.TrendRepository)
  }

  /**
   * 雑談のネタをランダムに1つ収集する
   */
  async collectRandomly(): Promise<Topic> {
    const repository = this.pickRepositoryRandomly()
    return await repository.getRandomly()
  }

  /**
   * 雑談のネタ（単語）をランダムに1つ収集する
   */
  async collectWordRandomly(): Promise<Topic> {
    const repository = this.pickRepositoryRandomly('word')
    return await repository.getRandomly()
  }

  /**
   * 雑談のネタ（トレンド）をランダムに1つ収集する
   */
  async collectTrendRandomly(): Promise<Topic> {
    return await this.trendRepository.getRandomly()
  }

  private pickRepositoryRandomly(type?: 'word' | 'trend'): TopicRepository {
    let repositories: TopicRepository[]

    switch (type) {
      case 'word':
        repositories = [this.seriousWordRepository, this.foolishWordRepository]
        break
      case 'trend':
        repositories = [this.trendRepository]
        break
      default:
        repositories = [
          this.seriousWordRepository,
          this.foolishWordRepository,
          this.trendRepository,
        ]
    }

    const index = Math.floor(Math.random() * repositories.length)
    return repositories[index]
  }
}
