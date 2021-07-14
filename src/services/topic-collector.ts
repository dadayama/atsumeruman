import { Topic } from '../vo'

export type TopicCollector = {
  collectRandomly(): Promise<Topic>
  collectWordRandomly(): Promise<Topic>
  collectTrendRandomly(): Promise<Topic>
}
