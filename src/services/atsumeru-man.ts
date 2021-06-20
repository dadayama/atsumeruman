import { Members } from '../entities'
import { MemberRepository } from '../repositories'
import { Notifier } from './notifier'

export class AtsumeruMan {
  constructor(
    private readonly currentMemberRepository: MemberRepository,
    private readonly historyMemberRepository: MemberRepository,
    private readonly notifier: Notifier
  ) {}

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
    const historyMembers = await this.historyMemberRepository.getAll()

    // 現在のメンバー一覧から、招集履歴に存在しないメンバーのみを抽出する
    let targetMembers = currentMembers.remove(historyMembers)
    const numberOfMember = targetMembers.length

    if (numberOfMember === numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数と取得人数が一致する場合は再抽出不要だが、次のために履歴の削除だけしておく
      this.historyMemberRepository.delete(historyMembers)
    } else if (numberOfMember > numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を上回る場合、抽出したメンバーからさらにランダムに取得人数分だけ抽出する
      targetMembers = targetMembers.pickRandomized(numberOfTargetMember)
      // 抽出したメンバーは履歴に記録しておく
      this.historyMemberRepository.save(targetMembers)
    } else if (numberOfMember < numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を下回る場合、現在のメンバー一覧から不足分を抽出して補う
      const numberToAdd = numberOfTargetMember - numberOfMember
      targetMembers = targetMembers.add(
        currentMembers.remove(targetMembers).pickRandomized(numberToAdd)
      )

      // 履歴が埋まるためリセットし、再度抽出したメンバーを記録しておく
      this.historyMemberRepository.delete(historyMembers)
      this.historyMemberRepository.save(targetMembers)
    }

    return targetMembers
  }
}
