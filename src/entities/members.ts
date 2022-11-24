import { Member } from './member'

export type CreateParams = Array<{
  id: string
  name: string
}>

export class Members {
  constructor(private readonly members: Member[] = []) {}

  *[Symbol.iterator](): Iterator<Member> {
    yield* this.members
  }

  static create(params: CreateParams): Members {
    return new Members(params.map(({ id, name }) => new Member(id, name)))
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

  pickRandomly(numberOfMember: number): Members {
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

  pickRandomlyToFill(numberOfTargetMember: number, supplyMembers: Members): Members {
    const numberOfMember = this.members.length

    if (numberOfMember > numberOfTargetMember) {
      // メンバー数が指定数を上回る場合、ランダムに指定数分のメンバーを抽出する
      return this.pickRandomly(numberOfTargetMember)
    } else if (numberOfMember < numberOfTargetMember) {
      // メンバー数が指定数を下回る場合、追加のメンバー一覧から不足分を抽出して補う
      const numberToAdd = numberOfTargetMember - numberOfMember
      return this.add(supplyMembers.remove(this).pickRandomly(numberToAdd))
    }

    return this
  }
}
