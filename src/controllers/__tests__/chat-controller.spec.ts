import { Member, Members } from '../../entities'
import { MemberManager, Notifier } from '../../services'
import { ChatController } from '..'

const MockMemberManager: jest.Mock<MemberManager> = jest.fn().mockImplementation(() => {
  return {
    addTargetMember: jest.fn(),
    removeTargetMember: jest.fn(),
    getTargetMembers: jest.fn(),
    getChattingMembers: jest.fn(),
    pickTargetMembersRandomly: jest.fn(),
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

    beforeEach(() => {
      members = new Members([
        new Member('1', 'name'),
        new Member('2', 'name'),
        new Member('3', 'name'),
      ])
    })

    it('end the chat if it is not finished', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(members)

      await chatController.start('destination', 3, 'url')
      expect(mockMemberManager.releaseChattingStatusFromMembers).toBeCalledTimes(1)
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

    it('change the status of a member called to a chat to Chatting status', async () => {
      ;(mockMemberManager.pickTargetMembersRandomly as jest.Mock).mockReturnValue(members)

      await chatController.start('destination', 3, 'url')
      expect(mockMemberManager.changeMembersStatusToChatting).toHaveBeenCalledWith(members)
    })
  })
})
