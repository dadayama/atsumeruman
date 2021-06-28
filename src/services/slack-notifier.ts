import { WebClient, LogLevel } from '@slack/web-api'
import { Notifier, NotifierHandleError } from './notifier'
import { Member, Members } from '../entities'

type Args = {
  channel: string
} & ({ token: string; logLevel?: LogLevel } | { client: WebClient })

export class SlackNotifier implements Notifier {
  private readonly client: WebClient
  private readonly channel: string

  constructor(args: Args) {
    this.channel = args.channel

    if ('token' in args) {
      const { token, logLevel } = args
      this.client = new WebClient(token, {
        logLevel: logLevel || LogLevel.DEBUG,
      })
    } else {
      this.client = args.client
    }
  }

  async notify(message: string, targetMembers?: Member | Members): Promise<void> {
    try {
      let text: string = message

      if (targetMembers) {
        const _targetMembers =
          targetMembers instanceof Member ? [targetMembers] : [...targetMembers]
        const mention = [..._targetMembers].map(({ id }) => `<@${id}>`).join(' ')
        text = `${mention}\n${message}`
      }

      this.client.chat.postMessage({
        channel: this.channel,
        text,
      })
    } catch (e) {
      throw new NotifierHandleError(e?.message || 'Failed to notification to Slack.')
    }
  }

  async notifySecretly(message: string, targetMember: Member): Promise<void> {
    try {
      this.client.chat.postEphemeral({
        channel: this.channel,
        user: targetMember.id,
        text: message,
      })
    } catch (e) {
      throw new NotifierHandleError(e?.message || 'Failed to notification to Slack.')
    }
  }
}
