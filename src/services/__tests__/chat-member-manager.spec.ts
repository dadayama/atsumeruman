import { Member, Members } from '../../entities'
import { MemberRepository, TargetMemberRepository } from '../../repositories'
import { MemberManager, ChatMemberManager, DuplicatedMemberError, NotFoundMemberError } from '..'

const MockMemberRepository: jest.Mock<MemberRepository> = jest.fn().mockImplementation(() => {
  return {
    getAll: jest.fn(),
    findById: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  } as MemberRepository
})

const fakeMemberRepository: MemberRepository = {
  getAll: async () => new Members(),
  findById: async () => new Member('fake id', 'fake name'),
  add: async () => undefined,
  remove: async () => undefined,
}

describe('ChatMemberManager', () => {
  let chatMemberManager: MemberManager
  let mockTargetMemberRepository: TargetMemberRepository

  beforeEach(() => {
    mockTargetMemberRepository = new MockMemberRepository()
  })

  describe('addTargetMember()', () => {
    let member: Member

    beforeEach(() => {
      chatMemberManager = new ChatMemberManager(
        mockTargetMemberRepository,
        fakeMemberRepository,
        fakeMemberRepository
      )
      member = new Member('id', 'name')
    })

    it('perpetuate member as a subject to chat if a member is unregistered', async () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(undefined)

      await chatMemberManager.addTargetMember(member)
      expect(mockTargetMemberRepository.add).toBeCalledWith(member)
    })

    it('throws error if a member was registered', () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(member)

      expect(async () => {
        await chatMemberManager.addTargetMember(member)
      }).rejects.toThrowError(DuplicatedMemberError)
      expect(mockTargetMemberRepository.add).toBeCalledTimes(0)
    })

    afterEach(() => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockClear()
      ;(mockTargetMemberRepository.add as jest.Mock).mockClear()
    })
  })

  describe('removeTargetMember()', () => {
    let member: Member

    beforeEach(() => {
      mockTargetMemberRepository = new MockMemberRepository()
      chatMemberManager = new ChatMemberManager(
        mockTargetMemberRepository,
        fakeMemberRepository,
        fakeMemberRepository
      )
      member = new Member('id', 'name')
    })

    it('remove persistent member if a member is unregistered', async () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(member)

      await chatMemberManager.removeTargetMember(member)
      expect(mockTargetMemberRepository.remove).toBeCalledWith(member)
    })

    it('throws error if a member was unregistered', () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(undefined)

      expect(async () => {
        await chatMemberManager.removeTargetMember(member)
      }).rejects.toThrowError(NotFoundMemberError)
      expect(mockTargetMemberRepository.remove).toBeCalledTimes(0)
    })

    afterEach(() => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockClear()
      ;(mockTargetMemberRepository.remove as jest.Mock).mockClear()
    })
  })

  describe('pickTargetMembersRandomly()', () => {
    let targetMembers: Members
    let historyMembers: Members

    beforeEach(() => {
      mockTargetMemberRepository = new MockMemberRepository()
      chatMemberManager = new ChatMemberManager(
        mockTargetMemberRepository,
        fakeMemberRepository,
        fakeMemberRepository
      )

      targetMembers = new Members([
        new Member('1', 'name'),
        new Member('2', 'name'),
        new Member('3', 'name'),
        new Member('4', 'name'),
        new Member('5', 'name'),
      ])
      historyMembers = new Members([new Member('1', 'name'), new Member('2', 'name')])
    })

    it('pick a specified number of members from all members if members does not exist in the chat history', async () => {
      ;(mockTargetMemberRepository.getAll as jest.Mock).mockReturnValue(targetMembers)

      const pickedMembers = await chatMemberManager.pickTargetMembersRandomly(3, historyMembers)
      expect(pickedMembers.count).toStrictEqual(3)
      expect([...targetMembers]).toEqual(expect.arrayContaining([...pickedMembers]))
    })

    it('pick a specified number of members not included in the chat history if a member exists in the chat history', async () => {
      ;(mockTargetMemberRepository.getAll as jest.Mock).mockReturnValue(targetMembers)

      const pickedMembers = await chatMemberManager.pickTargetMembersRandomly(3, historyMembers)
      expect(pickedMembers.count).toStrictEqual(3)
      expect([...pickedMembers]).toEqual(expect.not.arrayContaining([...historyMembers]))
    })

    afterEach(() => {
      ;(mockTargetMemberRepository.getAll as jest.Mock).mockClear()
    })
  })
})
