import { Members } from '../entities'
import { ChattingMemberRepository, HistoryMemberRepository } from '../repositories'

export interface SessionService {
  start(participants: Members): Promise<void>
  end(): Promise<void>
}

export class SessionService implements SessionService {
  constructor(
    private readonly chattingMemberRepository: ChattingMemberRepository,
    private readonly historyMemberRepository: HistoryMemberRepository
  ) {}

  start(participants: Members): Promise<void> {
    return Promise.resolve()
  }

  end(): Promise<void> {
    return Promise.resolve()
  }
}
