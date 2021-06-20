import { WebClient, LogLevel, UsersListResponse } from '@slack/web-api'
import { MemberRepository } from './member-repository'
import { Member, Members } from '../entities'

const IGNORE_MEMBER_IDS = ['USLACKBOT']

export class SlackAPIHandleError extends Error {}

export type SearchOptions = {
  ignoreBot?: boolean
  ignoreDeleted?: boolean
}

type SlackMember = Required<Pick<NonNullable<UsersListResponse['members']>[number], 'id'>>

export class SlackMemberRepository implements MemberRepository {
  private readonly client: WebClient

  constructor(args: { token: string; logLevel?: LogLevel } | { client: WebClient }) {
    if ('client' in args) {
      this.client = args.client
    } else {
      const { token, logLevel } = args
      this.client = new WebClient(token, {
        logLevel: logLevel || LogLevel.DEBUG,
      })
    }
  }

  async getAll(): Promise<Members> {
    try {
      const { members: slackMembers } = await this.client.users.list()
      if (typeof slackMembers === 'undefined') return new Members([])

      const validSlackMembers = slackMembers.filter(
        ({ id, is_bot: isBot, deleted: hasDeleted }) =>
          typeof id !== 'undefined' && !IGNORE_MEMBER_IDS.includes(id) && !isBot && !hasDeleted
      )
      return this.buildMembers(validSlackMembers as SlackMember[])
    } catch (e) {
      throw new SlackAPIHandleError(e?.message || 'Failed to get the Slack members data.')
    }
  }

  async save(): Promise<void> {
    return Promise.resolve()
  }

  async delete(): Promise<void> {
    return Promise.resolve()
  }

  private buildMembers(slackMembers: SlackMember[]): Members {
    const args = slackMembers.map(({ id }) => new Member(id))
    return new Members(args)
  }
}
