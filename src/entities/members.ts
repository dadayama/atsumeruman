import { Member } from './member'

export class Members {
  constructor(private readonly members: Member[]) {}

  get length(): number {
    return this.members.length
  }

  get list(): Member[] {
    return this.members
  }

  toIds(): string[] {
    return this.members.map((member) => member.id)
  }

  add(members: Member | Members): Members {
    return new Members([...this.members, ...(members instanceof Member ? [members] : members.list)])
  }

  remove(members: Member | Members): Members {
    const memberIds = members instanceof Member ? [members.id] : members.toIds()
    const filteredMembers = this.members.filter((member) => !memberIds.includes(member.id))
    return new Members(filteredMembers)
  }

  pickRandomized(number: number): Members {
    if (this.members.length <= number) {
      return this
    }

    const randomized = []
    const members = [...this.members]

    for (let i = 0; i < number; i++) {
      const index = Math.floor(Math.random() * members.length)
      randomized[i] = members[index]
      members.splice(index, 1)
    }

    return new Members(randomized)
  }
}
