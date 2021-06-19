import { Member } from '../entities/member'
import { Members } from '../entities/members'

export interface MemberRepository {
  getAll(): Promise<Members>
  search(...args: unknown[]): Promise<Members>
  delete?(members: Member | Members): Promise<void>
}
