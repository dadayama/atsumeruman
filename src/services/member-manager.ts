import { Member, Members } from '../entities'

export class DuplicatedMemberError extends Error {}
export class NotFoundMemberError extends Error {}

export type MemberManager = {
  addTargetMember(member: Member): Promise<void>
  removeTargetMember(member: Member): Promise<void>
  getTargetMembers(): Promise<Members>
  getChattingMembers(): Promise<Members>
  getHistoryMembers(): Promise<Members>
  pickTargetMembersRandomly(numberOfTargetMember: number, historyMembers: Members): Promise<Members>
  flushHistory(): Promise<void>
  changeMembersStatusToChatting(members: Members): Promise<void>
  changeMembersStatusToUnChatting(members: Members): Promise<void>
  releaseChattingStatusFromMembers(): Promise<void>
}
