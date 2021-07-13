import { Topic } from '../vo'

export class TopicRepositoryHandleError extends Error {}

export type TopicRepository = {
  getRandomly(): Promise<Topic>
}
