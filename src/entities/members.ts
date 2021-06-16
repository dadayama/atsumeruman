import { Member } from './member'

export type Args = { id: string; name: string }[]

export class Members {
  constructor(private readonly members: Member[]) {}

  static build(args: Args): Members {
    return new Members(args.map(({ id, name }) => new Member(id, name)))
  }

  get length(): number {
    return this.members.length
  }

  get list(): Member[] {
    return this.members
  }

  toIds(): string[] {
    return this.members.map((member) => member.id)
  }

  filtered(ignoredMembers: Members): Members {
    const ignoredMemberIds = ignoredMembers.toIds()
    const filteredMembers = this.members.filter((member) => !ignoredMemberIds.includes(member.id))
    return new Members(filteredMembers)
  }

  pickRandomized(number = 5): Members {
    const length = this.members.length

    if (length <= number) {
      return this
    }

    const randomized = []
    const members = [...this.members]

    for (let i = 0; i < number; i++) {
      const index = Math.floor(Math.random() * length)
      randomized[i] = members[index]
      members.splice(index, 1)
    }

    return new Members(randomized)
  }
}
