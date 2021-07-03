import { Member, Members } from '../entities'
import { MemberRepository } from '../repositories'

export class DuplicatedMemberError extends Error {}
export class NotFoundMemberError extends Error {}

export class AtsumeruMan {
  private readonly currentMemberRepository: MemberRepository
  private readonly historyMemberRepository: MemberRepository

  constructor({
    currentMemberRepository,
    historyMemberRepository,
  }: {
    currentMemberRepository: MemberRepository
    historyMemberRepository: MemberRepository
  }) {
    this.currentMemberRepository = currentMemberRepository
    this.historyMemberRepository = historyMemberRepository
  }

  /**
   * 招集対象メンバーに追加する
   * @param {string} memberId メンバーID
   * @param {string} memberName メンバー名
   */
  async addMember(memberId: string, memberName: string): Promise<void> {
    const member = new Member(memberId, memberName)

    const hasBeenAdded = await this.hasBeenAdded(member)
    if (hasBeenAdded) {
      throw new DuplicatedMemberError('Member have already joined.')
    }

    await this.currentMemberRepository.add(member)
  }

  /**
   * 招集対象メンバーから削除する
   * @param {string} memberId メンバーID
   * @param {string} memberName メンバー名
   */
  async removeMember(memberId: string, memberName: string): Promise<void> {
    const member = new Member(memberId, memberName)

    const hasBeenAdded = await this.hasBeenAdded(member)
    if (!hasBeenAdded) {
      throw new NotFoundMemberError('Member have not joined')
    }

    await this.currentMemberRepository.remove(member)
  }

  /**
   * 招集対象メンバー一覧を取得する
   */
  async getAddedMembersList(): Promise<Members> {
    return await this.currentMemberRepository.getAll()
  }

  /**
   * 招集対象メンバーをランダムに取得する
   * 現在のメンバー一覧と招集履歴を突き合わせ、可能な限り履歴に存在しないメンバーを選ぶ
   * @param {number} numberOfTargetMember 取得人数
   */
  async pickMembers(numberOfTargetMember: number): Promise<Members> {
    const currentMembers = await this.currentMemberRepository.getAll()
    const gatheredMembers = await this.historyMemberRepository.getAll()

    // 現在のメンバー一覧から、招集履歴に存在しないメンバーのみを抽出する
    let targetMembers = currentMembers.remove(gatheredMembers)
    const numberOfMember = targetMembers.length

    if (numberOfMember > numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を上回る場合、抽出したメンバーからさらにランダムに取得人数分だけ抽出する
      targetMembers = targetMembers.pickRandomized(numberOfTargetMember)
    } else if (numberOfMember < numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を下回る場合、現在のメンバー一覧から不足分を抽出して補う
      const numberToAdd = numberOfTargetMember - numberOfMember
      targetMembers = targetMembers.add(
        currentMembers.remove(targetMembers).pickRandomized(numberToAdd)
      )
      // 記録が埋まるので全記録をクリアする
      await this.historyMemberRepository.remove(gatheredMembers)
    }

    await this.historyMemberRepository.add(targetMembers)

    return targetMembers
  }

  /**
   * 招集対象メンバーの有無を確認する
   * @param {string} member メンバー
   */
  private async hasBeenAdded(member: Member): Promise<boolean> {
    const _member = await this.currentMemberRepository.findById(member.id)
    return !!_member
  }
}
