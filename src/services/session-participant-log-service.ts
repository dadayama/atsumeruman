import { Members } from '../entities'
import { ChattingMemberRepository, HistoryMemberRepository } from '../repositories'

export interface SessionParticipantLogService {
  getLatest(): Promise<Members>
  getPast(): Promise<Members>
  flush(): Promise<void>
}

export class SessionParticipantLogService implements SessionParticipantLogService {
  constructor(
    private readonly chattingMemberRepository: ChattingMemberRepository,
    private readonly historyMemberRepository: HistoryMemberRepository
  ) {}

  getLatest(): Promise<Members> {
    return Promise.resolve(new Members([]))
  }

  getPast(): Promise<Members> {
    return Promise.resolve(new Members([]))
  }

  flush(): Promise<void> {
    return Promise.resolve()
  }
}
