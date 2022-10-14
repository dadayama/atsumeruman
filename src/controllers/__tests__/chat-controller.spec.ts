import { Member, Members } from '../../entities'
import { MemberManager, Notifier } from '../../services'
import { ChatController } from '..'

const MockMemberManager: jest.Mock<MemberManager> = jest.fn().mockImplementation(() => {
  return {
    addTargetMember: jest.fn(),
    removeTargetMember: jest.fn(),
    getTargetMembers: jest.fn(),
    getChattingMembers: jest.fn(),
    getHistoryMembers: jest.fn(),
    pickTargetMembersRandomly: jest.fn(),
    flushHistory: jest.fn(),
    changeMembersStatusToChatting: jest.fn(),
    changeMembersStatusToUnChatting: jest.fn(),
    releaseChattingStatusFromMembers: jest.fn(),
  } as MemberManager
})

const MockNotifier: jest.Mock<Notifier> = jest.fn().mockImplementation(() => {
  return {
    notify: jest.fn(),
    notifyPrivately: jest.fn(),
  } as Notifier
})

describe('ChatController', () => {
  let mockMemberManager: MemberManager
  let mockNotifier: Notifier
  let chatController: ChatController

  beforeEach(() => {
    mockMemberManager = new MockMemberManager()
    mockNotifier = new MockNotifier()
    chatController = new ChatController(mockMemberManager, mockNotifier)
  })

  describe('start()', () => {
    let members: Members
    let emptyMembers: Members

    beforeEach(() => {
      members = new Members([
        new Member('1', 'name'),
        new Member('2', 'name'),
        new Member('3', 'name'),
      ])
      emptyMembers = new Members()
    })

    it('end the chat if it is not finished', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(members)

      await chatController.start('destination', 3, 'url')
      expect(mockMemberManager.releaseChattingStatusFromMembers).toBeCalledTimes(1)
    })

    it('do nothing if there are no members', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(emptyMembers)

      await chatController.start('destination', 3, 'url')
      expect(mockNotifier.notify).toBeCalledTimes(0)
      expect(mockMemberManager.changeMembersStatusToChatting).toBeCalledTimes(0)
    })

    it('delete the history and reacquire the member to make up for the missing member if members are missing', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(members)

      const numberOfTargetMember = 4
      const diff = numberOfTargetMember - members.count
      await chatController.start('destination', numberOfTargetMember, 'url')

      expect(mockMemberManager.flushHistory).toBeCalledTimes(1)
      expect(mockMemberManager.pickTargetMembersRandomly).toHaveBeenNthCalledWith(2, diff, members)
      expect(mockMemberManager.changeMembersStatusToChatting).toBeCalledWith(members)
    })

    it('notify the start of a chat', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(members)

      await chatController.start('destination', 3, 'url')
      expect(mockNotifier.notify).toBeCalledWith(
        'destination',
        "It's time to have a little chat.\nLet's get together :clap:\nurl",
        members
      )
    })

    it('change the status of a member called to a chat to chatting status', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(members)

      await chatController.start('destination', 3, 'url')
      expect(mockMemberManager.changeMembersStatusToChatting).toBeCalledWith(members)
    })
  })

  describe('end()', () => {
    let members: Members
    let emptyMembers: Members

    beforeEach(() => {
      members = new Members([
        new Member('1', 'name'),
        new Member('2', 'name'),
        new Member('3', 'name'),
      ])
      emptyMembers = new Members()
    })

    it('do nothing if there are no chatting members', async () => {
      ;(mockMemberManager.getChattingMembers as jest.Mock).mockReturnValue(emptyMembers)

      await chatController.end('destination')
      expect(mockNotifier.notify).toBeCalledTimes(0)
      expect(mockMemberManager.changeMembersStatusToUnChatting).toBeCalledTimes(0)
    })

    it('notify the end of a chat', async () => {
      ;(mockMemberManager.getChattingMembers as jest.Mock).mockReturnValue(members)

      await chatController.end('destination')
      expect(mockNotifier.notify).toBeCalledWith(
        'destination',
        "It's time to finish chatting :pray:",
        members
      )
    })

    it('change the status of a member called to a chat to un chatting status', async () => {
      ;(mockMemberManager.getChattingMembers as jest.Mock).mockReturnValue(members)

      await chatController.end('destination')
      expect(mockMemberManager.changeMembersStatusToUnChatting).toBeCalledWith(members)
    })
  })

  afterEach(() => {
    ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockClear()
    ;(mockMemberManager.flushHistory as jest.Mock).mockClear()
    ;(mockMemberManager.changeMembersStatusToChatting as jest.Mock).mockClear()
    ;(mockNotifier.notify as jest.Mock).mockClear()
  })
})
