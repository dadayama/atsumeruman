import { WebClient, LogLevel } from '@slack/web-api'
import { Notifier } from './notifier'
import { Members } from '../entities'

export class SlackHandleError extends Error {}

export class SlackNotifier implements Notifier {
  private readonly client: WebClient

  constructor(args: { token: string; logLevel?: LogLevel } | { client: WebClient }) {
    if ('token' in args) {
      const { token, logLevel } = args
      this.client = new WebClient(token, {
        logLevel: logLevel || LogLevel.DEBUG,
      })
    } else {
      this.client = args.client
    }
  }

  async notify(channel: string, message: string, targetMembers?: Members): Promise<void> {
    try {
      let text: string = message

      if (targetMembers instanceof Members) {
        const mention = targetMembers
          .toIds()
          .map((id) => `<@${id}>`)
          .join(' ')
        text = `${mention}\n${message}`
      }

      this.client.chat.postMessage({
        channel,
        text,
      })
    } catch (e) {
      throw new SlackHandleError(e?.message || 'Failed to notification to Slack.')
    }
  }
}
