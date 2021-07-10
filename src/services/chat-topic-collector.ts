import 'reflect-metadata'
import { Topic } from '../entities'
import { WordRepository, SeriousWordRepository, FoolishWordRepository } from '../repositories'
import { di } from '../utils'

/**
 * 雑談のネタを取り扱う
 */
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
    const word = await repository.getRandomly()
    return new Topic(word.value, word.descriptionUrl)
  }

  private pickWordRepositoryRandomly(): WordRepository {
    const repositories = [this.seriousWordRepository, this.foolishWordRepository]
    const index = Math.floor(Math.random() * repositories.length)
    return repositories[index]
  }
}
