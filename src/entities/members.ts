import { Member } from './member'

export class Members {
  constructor(private readonly members: Member[] = []) {}

  *[Symbol.iterator](): Iterator<Member> {
    yield* this.members
  }

  get count(): number {
    return this.members.length
  }

  add(members: Member | Members): Members {
    return new Members([...this.members, ...(members instanceof Member ? [members] : [...members])])
  }

  remove(members: Member | Members): Members {
    const memberIds = members instanceof Member ? [members.id] : [...members].map(({ id }) => id)
    const _members = this.members.filter(({ id }) => !memberIds.includes(id))
    return new Members(_members)
  }

  pickRandomized(numberOfMember: number): Members {
    if (this.members.length <= numberOfMember) {
      return this
    }

    const randomized = []
    const members = [...this.members]

    for (let i = 0; i < numberOfMember; i++) {
      const index = Math.floor(Math.random() * members.length)
      randomized[i] = members[index]
      members.splice(index, 1)
    }

    return new Members(randomized)
  }
}
