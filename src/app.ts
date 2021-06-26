import { Member, Members } from './entities'
import { MemberRepository } from './repositories'
import { Notifier } from './services'

export class DuplicatedMemberError extends Error {}
export class NotFoundMemberError extends Error {}

export class App {
  constructor(
    private readonly currentMemberRepository: MemberRepository,
    private readonly historyMemberRepository: MemberRepository,
    private readonly notifier: Notifier
  ) {}

  /**
   * 招集対象メンバーをランダムに取得し、通知を送る
   * @param {string} destination 通知先
   * @param {number} numberOfTargetMember 取得人数
   * @param {string} message 通知するメッセージ
   */
  async gather(destination: string, numberOfTargetMember: number, message: string): Promise<void> {
    const targetMembers = await this.pickMembers(numberOfTargetMember)
    if (targetMembers.length > 0) {
      await this.notifier.notify(destination, message, targetMembers)
    }
  }

  /**
   * 招集対象メンバーに追加する
   * @param {string} memberId メンバーID
   * @param {string} memberName メンバー名
   */
  async join(memberId: string, memberName: string): Promise<void> {
    const hasBeenJoined = await this.hasBeenJoined(memberId)
    if (hasBeenJoined) {
      throw new DuplicatedMemberError('Member have already joined.')
    }

    const member = new Member(memberId, memberName)
    await this.currentMemberRepository.add(member)
  }

  /**
   * 招集対象メンバーから削除する
   * @param {string} memberId メンバーID
   * @param {string} memberName メンバー名
   */
  async leave(memberId: string, memberName: string): Promise<void> {
    const hasBeenJoined = await this.hasBeenJoined(memberId)
    if (!hasBeenJoined) {
      throw new NotFoundMemberError('Member have not joined')
    }

    const member = new Member(memberId, memberName)
    await this.currentMemberRepository.remove(member)
  }

  /**
   * 招集対象メンバーの有無を確認する
   * @param {string} memberId メンバーID
   */
  private async hasBeenJoined(memberId: string): Promise<boolean> {
    return await this.currentMemberRepository.exists(memberId)
  }

  /**
   * 招集対象メンバーをランダムに取得する
   * 現在のメンバー一覧と招集履歴を突き合わせ、可能な限り履歴に存在しないメンバーを選ぶ
   * @param {number} numberOfTargetMember 取得人数
   */
  private async pickMembers(numberOfTargetMember: number): Promise<Members> {
    const currentMembers = await this.currentMemberRepository.getAll()
    const gatheredMembers = await this.historyMemberRepository.getAll()

    // 現在のメンバー一覧から、招集履歴に存在しないメンバーのみを抽出する
    let targetMembers = currentMembers.remove(gatheredMembers)
    const numberOfMember = targetMembers.length

    let shouldFlush = false

    if (numberOfMember > numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を上回る場合、抽出したメンバーからさらにランダムに取得人数分だけ抽出する
      targetMembers = targetMembers.pickRandomized(numberOfTargetMember)
    } else if (numberOfMember < numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を下回る場合、現在のメンバー一覧から不足分を抽出して補う
      const numberToAdd = numberOfTargetMember - numberOfMember
      targetMembers = targetMembers.add(
        currentMembers.remove(targetMembers).pickRandomized(numberToAdd)
      )
      // 記録が埋まるので全記録をリセットする
      shouldFlush = true
    }

    this.recordHistory(targetMembers, shouldFlush)

    return targetMembers
  }

  /**
   * メンバーを招集履歴に記録する
   * @param {Members} members 記録対象のメンバー一覧
   * @param {boolean} shouldFlush 記録する前にこれまでの記録を削除するか否か
   */
  private async recordHistory(members: Members, shouldFlush = false): Promise<void> {
    if (shouldFlush) {
      await this.historyMemberRepository.flush()
    }
    this.historyMemberRepository.add(members)
  }
}
