import { WebClient, LogLevel } from '@slack/web-api'
import { Members, Args as MembersArgs } from '../entities/members'
import { MembersFactory } from './members-factory'

type Params = { token: string; logLevel?: LogLevel } | { client: WebClient }

export class APIError extends Error {}

export class Atsumeruman {
  private readonly client: WebClient

  constructor(params: Params) {
    if ('token' in params) {
      const { token, logLevel } = params
      this.client = new WebClient(token, {
        logLevel: logLevel || LogLevel.DEBUG,
      })
    } else {
      this.client = params.client
    }
  }

  async gather(channel: string, text?: string): Promise<void> {
    try {
      const randomizedMembers = await this.pickRandomizedMembers()
      const mention = randomizedMembers
        .toIds()
        .map((id) => `<@${id}>`)
        .join(' ')
      const message = text ? `${mention}\n${text}` : mention
      this.notify(channel, message)
    } catch (e) {
      throw new APIError(e?.message || 'API error.')
    }
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
    const members = await this.fetchActiveSlackMembers()
    return members.pickRandomized()
  }

  async fetchActiveSlackMembers(): Promise<Members> {
    try {
      const response = await this.client.users.list()
      return MembersFactory.buildFromSlackUsersListAPIResponse(response)
    } catch (e) {
      throw new APIError(e?.message || 'API error.')
    }
  }

  async notify(channel: string, text: string): Promise<void> {
    try {
      this.client.chat.postMessage({
        channel,
        text,
      })
    } catch (e) {
      throw new APIError(e?.message || 'API error.')
    }
  }
}
