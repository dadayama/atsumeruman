import { UsersListResponse } from '@slack/web-api'
import { Members, Args } from '../entities/members'

export class MembersFactory {
  static buildFromSlackUsersListAPIResponse(response: UsersListResponse): Members {
    const { members } = response
    const props =
      members
        ?.filter(
          ({ id, name, is_bot: isBot, deleted }) =>
            typeof id !== 'undefined' && name && !isBot && !deleted
        )
        .map(({ id, name }) => ({ id, name })) || []
    return Members.build(props as Args)
  }
}
