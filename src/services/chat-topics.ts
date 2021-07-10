import 'reflect-metadata'
import { Topic } from '../entities'
import { WordRepository } from '../repositories'
import { di } from '../utils'

export class MockError extends Error {}

export class ChatTopics {
  private readonly wordRepository: WordRepository

  constructor() {
    this.wordRepository = di.container.get<WordRepository>(di.TYPES.WordRepository)
  }

  async getTopicRandomly(): Promise<Topic> {
    const word = await this.wordRepository.getRandomly()
    return new Topic(word.value, word.descriptionUrl)
  }
}
