import { WebClient, LogLevel } from '@slack/web-api'
import { Notifier } from './notifier'

export class NotifyError extends Error {}

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

  async notify(channel: string, text: string): Promise<void> {
    try {
      this.client.chat.postMessage({
        channel,
        text,
      })
    } catch (e) {
      throw new NotifyError(e?.message || 'Failed to notification to Slack.')
    }
  }
}
