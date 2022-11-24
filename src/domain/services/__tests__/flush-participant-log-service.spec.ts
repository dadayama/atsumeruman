import { Members } from '../../../entities'
import { IFlushParticipantLogService, FlushParticipantLogService } from '..'
import { MemberRepository } from '../../../repositories'

const MockMemberRepository: jest.Mock<MemberRepository> = jest.fn().mockImplementation(() => {
  return {
    getAll: jest.fn(),
    findById: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  } as MemberRepository
})

describe('FlushParticipantLogService', () => {
  let mockHistoryMemberRepository: MemberRepository
  let flushParticipantLogService: IFlushParticipantLogService

  beforeEach(() => {
    mockHistoryMemberRepository = new MockMemberRepository()
    flushParticipantLogService = new FlushParticipantLogService(mockHistoryMemberRepository)
  })

  describe('execute()', () => {
    it('flush the log of participants if the number of unattended members is less than the number of participants in the next', async () => {
      const allMembers = Members.create([
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
        { id: '3', name: 'baz' },
        { id: '4', name: 'qux' },
        { id: '5', name: 'quux' },
      ])
      const historyMembers = Members.create([
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
        { id: '3', name: 'baz' },
      ])
      const numberOfNextParticipants = 3

      await flushParticipantLogService.execute(allMembers, historyMembers, numberOfNextParticipants)
      expect(mockHistoryMemberRepository.remove).toBeCalledTimes(1)
      expect(mockHistoryMemberRepository.remove).toBeCalledWith(historyMembers)
    })

    it("don't flush the log of participants if the number of unattended members is not less than the number of participants in the next", async () => {
      const allMembers = Members.create([
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
        { id: '3', name: 'baz' },
        { id: '4', name: 'qux' },
        { id: '5', name: 'quux' },
      ])
      const historyMembers = Members.create([
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
      ])
      const numberOfNextParticipants = 3

      await flushParticipantLogService.execute(allMembers, historyMembers, numberOfNextParticipants)
      expect(mockHistoryMemberRepository.remove).toBeCalledTimes(0)
    })
  })
})
