import { Member, Members } from '../entities'
import { TargetMemberRepository } from '../repositories'

export class DuplicatedMemberError extends Error {}

export class NotFoundMemberError extends Error {}

export type IMemberService = {
  add(member: Member): Promise<void>
  remove(member: Member): Promise<void>
  getAll(): Promise<Members>
  getRandomly(numberOfMember: number, excluded?: Members): Promise<Members>
}

export class MemberService implements IMemberService {
  // @ts-ignore
  constructor(private readonly repository: TargetMemberRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async add(member: Member): Promise<void> {
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(member: Member): Promise<void> {
    return Promise.resolve()
  }

  async getAll(): Promise<Members> {
    return Promise.resolve(new Members([]))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRandomly(numberOfMember: number, excluded?: Members | undefined): Promise<Members> {
    return Promise.resolve(new Members([]))
  }
}
