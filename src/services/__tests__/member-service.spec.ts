import { Member, Members } from '../../entities'
import {
  MemberRepository as IMemberRepository,
  TargetMemberRepository as MemberRepository,
} from '../../repositories'
import { IMemberService, MemberService } from '..'

const MockMemberRepository: jest.Mock<IMemberRepository> = jest.fn().mockImplementation(() => {
  return {
    getAll: jest.fn(),
    findById: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  } as IMemberRepository
})

describe('MemberService', () => {
  let memberService: IMemberService
  let mockMemberRepository: MemberRepository
  let member: Member

  beforeEach(() => {
    mockMemberRepository = new MockMemberRepository()
    memberService = new MemberService(mockMemberRepository)
    member = new Member('id', 'name')
  })

  describe('add()', () => {
    it('perpetuate member as a subject to chat if a member is unregistered', async () => {
      ;(mockMemberRepository.findById as jest.Mock).mockReturnValue(undefined)

      await memberService.add(member)
      expect(mockMemberRepository.add).toBeCalledWith(member)
    })

    it('throws error if a member was registered', async () => {
      ;(mockMemberRepository.findById as jest.Mock).mockReturnValue(member)

      await expect(memberService.add(member)).rejects.toThrow()
      expect(mockMemberRepository.add).toBeCalledTimes(0)
    })

    afterEach(() => {
      ;(mockMemberRepository.findById as jest.Mock).mockClear()
      ;(mockMemberRepository.add as jest.Mock).mockClear()
    })
  })

  describe('remove()', () => {
    it('remove persistent member if a member is unregistered', async () => {
      ;(mockMemberRepository.findById as jest.Mock).mockReturnValue(member)

      await memberService.remove(member)
      expect(mockMemberRepository.remove).toBeCalledWith(member)
    })

    it('throws error if a member was unregistered', async () => {
      ;(mockMemberRepository.findById as jest.Mock).mockReturnValue(undefined)

      await expect(memberService.remove(member)).rejects.toThrow()
      expect(mockMemberRepository.remove).toBeCalledTimes(0)
    })

    afterEach(() => {
      ;(mockMemberRepository.findById as jest.Mock).mockClear()
      ;(mockMemberRepository.remove as jest.Mock).mockClear()
    })
  })

  describe('getRandomly()', () => {
    let targetMembers: Members
    let historyMembers: Members

    beforeEach(() => {
      mockMemberRepository = new MockMemberRepository()
      memberService = new MemberService(mockMemberRepository)

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
      ;(mockMemberRepository.getAll as jest.Mock).mockReturnValue(targetMembers)

      const pickedMembers = await memberService.getRandomly(3, historyMembers)
      expect(pickedMembers.count).toStrictEqual(3)
      expect([...targetMembers]).toEqual(expect.arrayContaining([...pickedMembers]))
    })

    it('pick a specified number of members not included in the chat history if a member exists in the chat history', async () => {
      ;(mockMemberRepository.getAll as jest.Mock).mockReturnValue(targetMembers)

      const pickedMembers = await memberService.getRandomly(3, historyMembers)
      expect(pickedMembers.count).toStrictEqual(3)
      expect([...pickedMembers]).toEqual(expect.not.arrayContaining([...historyMembers]))
    })

    afterEach(() => {
      ;(mockMemberRepository.getAll as jest.Mock).mockClear()
    })
  })
})
