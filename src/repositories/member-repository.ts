import { Member, Members } from '../entities'

export type MemberRepository = {
  getAll(): Promise<Members>
  exists(memberId: string): Promise<boolean>
  add(member: Member): Promise<void>
  add(members: Members): Promise<void>
  remove(member: Member): Promise<void>
  remove(members: Members): Promise<void>
  flush(): Promise<void>
}
