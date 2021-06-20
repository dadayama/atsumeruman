import { Members } from '../entities'

export interface Notifier {
  notify(destination: string, targetMembers: Members, message: string): Promise<void>
}
