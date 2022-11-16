import { Member, Members } from '../entities'
import { TargetMemberRepository as MemberRepository } from '../repositories'

export class DuplicatedMemberError extends Error {}

export class NotFoundMemberError extends Error {}

export type IMemberService = {
  add(member: Member): Promise<void>
  remove(member: Member): Promise<void>
  getAll(): Promise<Members>
  getRandomly(numberOfMember: number, excluded?: Members): Promise<Members>
}

export class MemberService implements IMemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async add(member: Member): Promise<void> {
    const hasBeenAdded = await this.hasBeenAdded(member)
    if (hasBeenAdded) {
      throw new DuplicatedMemberError('Member have already joined.')
    }

    this.memberRepository.add(member)
  }

  async remove(member: Member): Promise<void> {
    const hasBeenAdded = await this.hasBeenAdded(member)
    if (!hasBeenAdded) {
      throw new NotFoundMemberError('Member have not joined')
    }

    this.memberRepository.remove(member)
  }

  async getAll(): Promise<Members> {
    return this.memberRepository.getAll()
  }

  async getRandomly(numberOfMember: number, excluded: Members = new Members()): Promise<Members> {
    const members = await this.memberRepository.getAll()
    return members.remove(excluded).pickRandomlyToFill(numberOfMember, members)
  }

  private async hasBeenAdded(member: Member): Promise<boolean> {
    const _member = await this.memberRepository.findById(member.id)
    return !!_member
  }
}
