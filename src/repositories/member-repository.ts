import { Member, Members } from '../entities'

export interface MemberRepository {
  getAll(): Promise<Members>
  save(): Promise<void>
  save(member: Member): Promise<void>
  save(members: Members): Promise<void>
  delete(): Promise<void>
  delete(member: Member): Promise<void>
  delete(members: Members): Promise<void>
}
