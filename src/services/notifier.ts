import { Member, Members } from '../entities'

export class NotifierHandleError extends Error {}

export type Notifier = {
  notify(message: string): Promise<void>
  notify(message: string, targetMembers: Member | Members): Promise<void>
}
