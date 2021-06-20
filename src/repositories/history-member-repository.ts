import { MemberRepository } from './member-repository'
import { Member, Members } from '../entities'

export type HistoryMemberRepository = MemberRepository & {
  add(member: Member): Promise<void>
  add(members: Members): Promise<void>
  remove(member: Member): Promise<void>
  remove(members: Members): Promise<void>
  flush(): Promise<void>
}
