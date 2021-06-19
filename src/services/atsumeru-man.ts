import { Members } from '../entities/members'
import { MemberRepository } from '../repositories/member-repository'
import { Notifier } from './notifier'

export class AtsumeruMan {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly notifier: Notifier
  ) {}

  async gather(channel: string, text?: string): Promise<void> {
    const randomizedMembers = await this.pickRandomizedMembers()
    const mention = randomizedMembers
      .toIds()
      .map((id) => `<@${id}>`)
      .join(' ')
    const message = text ? `${mention}\n${text}` : mention
    await this.notifier.notify(channel, message)
  }

  // 前提：履歴はメンバー1人に対して最大1レコード
  // 1. Slackのメンバー一覧を取得
  // 2. 履歴を取得
  // 3. Slackのメンバー一覧から履歴にマッチしないメンバーを抽出する
  // 4. 抽出したメンバーがn人の場合：履歴をクリア
  // 5. 抽出したメンバーがn人を超過する場合：
  //  5-1. Slackのメンバー一覧からランダムにn人を選択する
  //  5-2. 選択したメンバーを履歴に書き込む
  // 6. 抽出したメンバーがn人未満の場合：
  //  6-1. 履歴をクリア
  //  6-2. Slackのメンバー一覧から、抽出したメンバー以外のメンバーをランダムに選択する
  //  6-3. 抽出したor選択したメンバーを履歴に書き込む
  // 6. メンバーを返却
  async pickRandomizedMembers(): Promise<Members> {
    const members = await this.memberRepository.search({
      ignoreBot: true,
      ignoreDeleted: true,
    })
    return members.pickRandomized()
  }
}
