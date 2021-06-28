import fs from 'fs'
import { MemberRepository, MemberRepositoryHandleError } from './member-repository'
import { Member, Members } from '../entities'

export type MembersData = {
  members: { id: string; name: string }[]
}

export class FileMemberRepository implements MemberRepository {
  private readonly filePath: string

  constructor({ filePath }: { filePath: string }) {
    if (!fs.existsSync(filePath)) {
      throw new MemberRepositoryHandleError('File does not exist.')
    }

    this.filePath = filePath
  }

  async getAll(): Promise<Members> {
    try {
      return await this.readMembers(this.filePath)
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to get the member data.')
    }
  }

  async findById(memberId: string): Promise<Member | undefined> {
    try {
      const members = await this.readMembers(this.filePath)
      return members.findById(memberId)
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to find the member exists.')
    }
  }

  async add(members: Member | Members): Promise<void> {
    try {
      const currentMembers = await this.readMembers(this.filePath)
      await this.writeMembers(this.filePath, currentMembers.add(members))
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to add the members data.')
    }
  }

  async remove(members: Member | Members): Promise<void> {
    try {
      const currentMembers = await this.readMembers(this.filePath)
      await this.writeMembers(this.filePath, currentMembers.remove(members))
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to remove the members data.')
    }
  }

  async flush(): Promise<void> {
    try {
      await this.writeMembers(this.filePath, new Members([]))
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to flush the members data.')
    }
  }

  private readMembers(filePath: string): Members {
    const membersData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as MembersData
    const args = membersData.members.map(({ id, name }) => new Member(id, name))
    return new Members(args)
  }

  private writeMembers(filePath: string, members: Members) {
    const membersData = { members: [...members].map(({ id, name }) => ({ id, name })) }
    fs.writeFileSync(filePath, JSON.stringify(membersData))
  }
}
