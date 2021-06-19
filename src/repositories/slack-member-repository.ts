import { WebClient, LogLevel, UsersListResponse } from '@slack/web-api'
import { MemberRepository } from './member-repository'
import { Member } from '../entities/member'
import { Members } from '../entities/members'

export class FetchError extends Error {}

export type SearchOptions = {
  ignoreBot?: boolean
  ignoreDeleted?: boolean
}

type SlackMember = Required<Pick<NonNullable<UsersListResponse['members']>[number], 'id'>>

export class SlackMemberRepository implements MemberRepository {
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

  async getAll(): Promise<Members> {
    try {
      const { members: slackMembers } = await this.client.users.list()
      if (typeof slackMembers === 'undefined') return new Members([])

      return this.buildMembers(slackMembers as SlackMember[])
    } catch (e) {
      throw new FetchError(e?.message || 'Failed to get the Slack members data.')
    }
  }

  async search({ ignoreBot, ignoreDeleted }: SearchOptions): Promise<Members> {
    try {
      const slackMembers = await this.fetchSlackMembers()
      if (typeof slackMembers === 'undefined') {
        throw new FetchError('Slack members does not exist.')
      }

      const filteredSlackMembers = slackMembers.filter(({ is_bot: isBot, deleted: hasDeleted }) => {
        if (ignoreBot && isBot) return false
        if (ignoreDeleted && hasDeleted) return false
        return true
      }) as SlackMember[]

      return this.buildMembers(filteredSlackMembers)
    } catch (e) {
      throw new FetchError(e?.message || 'Failed to get the Slack members data.')
    }
  }

  private async fetchSlackMembers(): Promise<NonNullable<UsersListResponse['members']>> {
    const { members } = await this.client.users.list()
    return members?.filter(({ id }) => typeof id !== 'undefined') || []
  }

  private buildMembers(slackMembers: SlackMember[]): Members {
    const args = slackMembers.map(({ id }) => new Member(id))
    return new Members(args)
  }
}
