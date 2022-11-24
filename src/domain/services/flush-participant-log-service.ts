import { Members } from '../../entities'
import { HistoryMemberRepository } from '../../repositories'

export type IFlushParticipantLogService = {
  execute(
    allMembers: Members,
    pastParticipants: Members,
    numberOfNextParticipants: number
  ): Promise<void>
}

export class FlushParticipantLogService implements IFlushParticipantLogService {
  constructor(private readonly historyMemberRepository: HistoryMemberRepository) {}

  async execute(
    allMembers: Members,
    pastParticipants: Members,
    numberOfNextParticipants: number
  ): Promise<void> {
    const hasBeenReachedUpperLimit =
      allMembers.count - pastParticipants.count < numberOfNextParticipants

    if (hasBeenReachedUpperLimit) {
      await this.historyMemberRepository.remove(pastParticipants)
    }
  }
}
