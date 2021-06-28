import { Member, Members } from '../entities'

export class MemberRepositoryHandleError extends Error {}

export type MemberRepository = {
  getAll(): Promise<Members>
  findById(memberId: string): Promise<Member | undefined>
  add(member: Member): Promise<void>
  add(members: Members): Promise<void>
  remove(member: Member): Promise<void>
  remove(members: Members): Promise<void>
  flush(): Promise<void>
}
