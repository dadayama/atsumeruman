import { injectable } from 'inversify'
import 'reflect-metadata'
import { Topic } from '../vo'
import { TopicRepository, SeriousWordRepository, FoolishWordRepository } from '../repositories'
import * as di from '../di'

/**
 * 雑談のネタを取り扱う
 */
@injectable()
export class ChatTopicCollector {
  private readonly seriousWordRepository: SeriousWordRepository
  private readonly foolishWordRepository: FoolishWordRepository

  constructor() {
    this.seriousWordRepository = di.container.get<SeriousWordRepository>(
      di.TYPES.SeriousWordRepository
    )
    this.foolishWordRepository = di.container.get<FoolishWordRepository>(
      di.TYPES.FoolishWordRepository
    )
  }

  /**
   * 雑談のネタをランダムに1つ収集する
   */
  async collectTopicRandomly(): Promise<Topic> {
    const repository = this.pickWordRepositoryRandomly()
    return await repository.getRandomly()
  }

  private pickWordRepositoryRandomly(): TopicRepository {
    const repositories = [this.seriousWordRepository, this.foolishWordRepository]
    const index = Math.floor(Math.random() * repositories.length)
    return repositories[index]
  }
}
