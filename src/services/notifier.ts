import { Member, Members } from '../entities'

export class NotifierHandleError extends Error {}

export type Notifier = {
  notify(destination: string, message: string, targetMembers?: Member | Members): Promise<void>
  notifyPrivately(destination: string, message: string, targetMember: Member): Promise<void>
}
