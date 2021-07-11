import { injectable } from 'inversify'
import { WebClient, LogLevel } from '@slack/web-api'
import { Notifier, NotifierHandleError } from './notifier'
import { Member, Members } from '../entities'

type Args = { token: string; logLevel?: LogLevel } | { client: WebClient }

/**
 * Slack通知を取り扱う
 */
@injectable()
export class SlackNotifier implements Notifier {
  private readonly client: WebClient

  constructor(args: Args) {
    if ('token' in args) {
      const { token, logLevel } = args
      this.client = new WebClient(token, {
        logLevel: logLevel || LogLevel.DEBUG,
      })
    } else {
      this.client = args.client
    }
  }

  /**
   * 対象のチャンネル・メンバーに通知を送る
   * @param {string} channel 通知先
   * @param {string} message
   * @param {Members} targetMembers 通知対象メンバー
   */
  async notify(channel: string, message: string, targetMembers?: Member | Members): Promise<void> {
    try {
      let text: string = message

      if (targetMembers) {
        const _targetMembers =
          targetMembers instanceof Member ? [targetMembers] : [...targetMembers]
        const mention = _targetMembers.map(({ id }) => `<@${id}>`).join(' ')
        text = `${mention}\n${message}`
      }

      this.client.chat.postMessage({
        channel,
        text,
        mrkdwn: true,
      })
    } catch (e) {
      throw new NotifierHandleError(e?.message || 'Failed to notification to Slack.')
    }
  }

  /**
   * 対象のチャンネル・メンバーに通知を送る
   * @param {string} channel 通知先
   * @param {string} message
   * @param {Member} targetMember 通知対象メンバー
   */
  async notifyPrivately(channel: string, message: string, targetMember: Member): Promise<void> {
    try {
      this.client.chat.postEphemeral({
        channel,
        user: targetMember.id,
        text: message,
        mrkdwn: true,
      })
    } catch (e) {
      throw new NotifierHandleError(e?.message || 'Failed to notification to Slack.')
    }
  }
}
