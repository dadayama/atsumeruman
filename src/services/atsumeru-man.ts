import { Members } from '../entities'
import { CurrentMemberRepository, HistoryMemberRepository } from '../repositories'
import { Notifier } from './notifier'

export class AtsumeruMan {
  constructor(
    private readonly currentMemberRepository: CurrentMemberRepository,
    private readonly historyMemberRepository: HistoryMemberRepository,
    private readonly notifier: Notifier
  ) {}

  /**
   * 招集対象メンバーをランダムに取得し、通知を送る
   * @param {string} destination 通知先
   * @param {number} numberOfTargetMember 取得人数
   * @param {string} message 通知するメッセージ
   */
  async gather(destination: string, numberOfTargetMember: number, message: string): Promise<void> {
    const targetMembers = await this.pickGatherTargetMembers(numberOfTargetMember)
    await this.notifier.notify(destination, targetMembers, message)
  }

  /**
   * 招集対象メンバーをランダムに取得する
   * 現在のメンバー一覧と招集履歴を突き合わせ、可能な限り履歴に存在しないメンバーを選ぶ
   * @param {number} numberOfTargetMember 取得人数
   */
  async pickGatherTargetMembers(numberOfTargetMember: number): Promise<Members> {
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

    this.recordGatheringHistory(targetMembers, shouldFlush)

    return targetMembers
  }

  /**
   * メンバーを招集履歴に記録する
   * @param {Members} members 記録対象のメンバー一覧
   * @param {boolean} shouldFlush 記録する前にこれまでの記録を削除するか否か
   */
  async recordGatheringHistory(members: Members, shouldFlush = false): Promise<void> {
    if (shouldFlush) {
      await this.historyMemberRepository.flush()
    }
    this.historyMemberRepository.add(members)
  }
}
