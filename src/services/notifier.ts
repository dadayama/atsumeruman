import { Members } from '../entities'

export type Notifier = {
  notify(destination: string, targetMembers: Members, message: string): Promise<void>
}
