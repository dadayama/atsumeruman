import { Member, Members } from '../entities'
import { TargetMemberRepository } from '../repositories'

export interface MemberService {
  add(member: Member): Promise<void>
  remove(member: Member): Promise<void>
  getAll(): Promise<Members>
  getRandomly(numberOfMember: number, excluded?: Members): Promise<Members>
}

export class MemberService implements MemberService {
  constructor(private readonly repository: TargetMemberRepository) {}
  add(member: Member): Promise<void> {
    return Promise.resolve()
  }

  remove(member: Member): Promise<void> {
    return Promise.resolve()
  }

  getAll(): Promise<Members> {
    return Promise.resolve(new Members([]))
  }

  selectRandomly(numberOfMember: number, excluded?: Members | undefined): Promise<Members> {
    return Promise.resolve(new Members([]))
  }
}
