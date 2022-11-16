import { Member, Members } from '../../entities'
import { MemberRepository, TargetMemberRepository } from '../../repositories'
import { IMemberService, MemberService } from '..'

const MockMemberRepository: jest.Mock<MemberRepository> = jest.fn().mockImplementation(() => {
  return {
    getAll: jest.fn(),
    findById: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  } as MemberRepository
})

describe('MemberService', () => {
  let memberService: IMemberService
  let mockTargetMemberRepository: TargetMemberRepository
  let member: Member

  beforeEach(() => {
    mockTargetMemberRepository = new MockMemberRepository()
    memberService = new MemberService(mockTargetMemberRepository)
    member = new Member('id', 'name')
  })

  describe('add()', () => {
    it('perpetuate member as a subject to chat if a member is unregistered', async () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(undefined)

      await memberService.add(member)
      expect(mockTargetMemberRepository.add).toBeCalledWith(member)
    })

    it('throws error if a member was registered', async () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(member)

      await expect(memberService.add(member)).rejects.toThrow()
      expect(mockTargetMemberRepository.add).toBeCalledTimes(0)
    })

    afterEach(() => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockClear()
      ;(mockTargetMemberRepository.add as jest.Mock).mockClear()
    })
  })

  describe('remove()', () => {
    it('remove persistent member if a member is unregistered', async () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(member)

      await memberService.remove(member)
      expect(mockTargetMemberRepository.remove).toBeCalledWith(member)
    })

    it('throws error if a member was unregistered', async () => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockReturnValue(undefined)

      await expect(await memberService.remove(member)).rejects.toThrow()
      expect(mockTargetMemberRepository.remove).toBeCalledTimes(0)
    })

    afterEach(() => {
      ;(mockTargetMemberRepository.findById as jest.Mock).mockClear()
      ;(mockTargetMemberRepository.remove as jest.Mock).mockClear()
    })
  })

  describe('getRandomly()', () => {
    let targetMembers: Members
    let historyMembers: Members

    beforeEach(() => {
      mockTargetMemberRepository = new MockMemberRepository()
      memberService = new MemberService(mockTargetMemberRepository)

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

      const pickedMembers = await memberService.getRandomly(3, historyMembers)
      expect(pickedMembers.count).toStrictEqual(3)
      expect([...targetMembers]).toEqual(expect.arrayContaining([...pickedMembers]))
    })

    it('pick a specified number of members not included in the chat history if a member exists in the chat history', async () => {
      ;(mockTargetMemberRepository.getAll as jest.Mock).mockReturnValue(targetMembers)

      const pickedMembers = await memberService.getRandomly(3, historyMembers)
      expect(pickedMembers.count).toStrictEqual(3)
      expect([...pickedMembers]).toEqual(expect.not.arrayContaining([...historyMembers]))
    })

    afterEach(() => {
      ;(mockTargetMemberRepository.getAll as jest.Mock).mockClear()
    })
  })
})
