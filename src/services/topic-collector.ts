import { Topic } from '../entities'

export type TopicCollector = {
  collectTopicRandomly(): Promise<Topic>
}
