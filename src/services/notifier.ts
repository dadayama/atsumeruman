import { Members } from '../entities'

export type Notifier = {
  notify(destination: string, message: string): Promise<void>
  notify(destination: string, message: string, targetMembers: Members): Promise<void>
}
