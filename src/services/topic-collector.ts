import { Topic } from '../vo'

export type TopicCollector = {
  collectTopicRandomly(): Promise<Topic>
}
