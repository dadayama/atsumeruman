import 'reflect-metadata'
import * as di from '../di'
import {
  MemberManager,
  DuplicatedMemberError,
  NotFoundMemberError,
  TopicCollector,
  Notifier,
  NotifierHandleError,
} from '../services'
import { MemberRepositoryHandleError, TopicRepositoryHandleError } from '../repositories'
import { Member } from '../entities'

export class ChatController {
  private readonly memberManager: MemberManager
  private readonly topicCollector: TopicCollector
  private readonly notifier: Notifier

  constructor() {
    this.memberManager = di.container.get<MemberManager>(di.TYPES.MemberManager)
    this.topicCollector = di.container.get<TopicCollector>(di.TYPES.TopicCollector)
    this.notifier = di.container.get<Notifier>(di.TYPES.Notifier)
  }

  /**
   * メンバーを雑談の招集対象にする
   * @param {string} memberId
   * @param {string} memberName
   * @param {string} notificationDestination 通知先
   */
  async addTargetMember(
    memberId: string,
    memberName: string,
    notificationDestination: string
  ): Promise<void> {
    const member = new Member(memberId, memberName)

    try {
      await this.memberManager.addTargetMember(member)
      this.notifier.notify(notificationDestination, 'ｻﾝｶ ｱﾘｶﾞﾄ :tada:', member)
    } catch (e) {
      console.warn(e)

      if (e instanceof DuplicatedMemberError) {
        this.notifier.notifyPrivately(notificationDestination, 'ｻﾝｶ ｽﾞﾐ :+1:', member)
      } else if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify(notificationDestination, 'ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify(notificationDestination, 'ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * メンバーを雑談の招集対象から外す
   * @param {string} memberId
   * @param {string} memberName
   * @param {string} notificationDestination 通知先
   */
  async removeTargetMember(
    memberId: string,
    memberName: string,
    notificationDestination: string
  ): Promise<void> {
    const member = new Member(memberId, memberName)

    try {
      await this.memberManager.removeTargetMember(member)
      this.notifier.notify(notificationDestination, 'ﾊﾞｲﾊﾞｲ :wave:', member)
    } catch (e) {
      console.warn(e)

      if (e instanceof NotFoundMemberError) {
        this.notifier.notifyPrivately(notificationDestination, 'ｻﾝｶ ｼﾃ ｲﾅｲ :facepunch:', member)
      } else if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify(notificationDestination, 'ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify(notificationDestination, 'ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 招集対象のメンバー一覧を表示する
   * @param {string} notificationDestination 通知先
   */
  async listTargetMembers(notificationDestination: string): Promise<void> {
    try {
      const members = await this.memberManager.getTargetMembers()

      if (members.count) {
        const membersListString = [...members].map(({ name }) => `• *${name}*`).join('\n')
        this.notifier.notify(
          notificationDestination,
          `ｻﾝｶ ｼﾃｲﾙ ﾋﾄ ﾊ *${members.count}* ﾆﾝ ﾃﾞｽ :point_down:\n${membersListString}`
        )
      } else {
        this.notifier.notify(notificationDestination, 'ﾀﾞﾚﾓ ｻﾝｶ ｼﾃ ｲﾅｲ :anger:')
      }
    } catch (e) {
      console.warn(e)

      if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify(notificationDestination, 'ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify(notificationDestination, 'ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 雑談ネタを提供する
   * @param {string} memberId
   * @param {string} memberName
   * @param {string} notificationDestination 通知先
   */
  async provideTopicRandomly(
    memberId: string,
    memberName: string,
    notificationDestination: string
  ): Promise<void> {
    const member = new Member(memberId, memberName)

    try {
      const topic = await this.topicCollector.collectTopicRandomly()
      this.notifier.notify(
        notificationDestination,
        `「<${topic.descriptionUrl}|*${topic.title}*>」\nｦ ﾂｶｯﾃ ﾊﾅｼ ｦ ﾓﾘｱｹﾞﾖｳ :raised_hands:`,
        member
      )
    } catch (e) {
      console.warn(e)

      if (e instanceof TopicRepositoryHandleError) {
        this.notifier.notify(notificationDestination, 'ﾄﾋﾟｯｸ ﾉ ｼｭﾄｸ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify(notificationDestination, 'ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 雑談を開始する
   * @param {string} notificationDestination 通知先
   * @param {number} numberOfTargetMember 雑談に招集する人数
   * @param {string} chatUrl 雑談を行うURL
   */
  async start(
    notificationDestination: string,
    numberOfTargetMember: number,
    chatUrl: string
  ): Promise<void> {
    try {
      await this.memberManager.releaseChattingStatusFromMembers()

      const members = await this.memberManager.pickTargetMembersRandomly(numberOfTargetMember)
      if (members.count === 0) return

      const message = `ｻﾞﾂﾀﾞﾝ ﾉ ｼﾞｶﾝ ﾀﾞﾖ\nｱﾂﾏﾚｰ :clap:\n${chatUrl}`
      await this.notifier.notify(notificationDestination, message, members)

      await this.memberManager.changeMembersStatusToChatting(members)
    } catch (e) {
      console.warn(e)

      if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify(notificationDestination, 'ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else if (e instanceof NotifierHandleError) {
        this.notifier.notify(notificationDestination, 'ﾂｳﾁ ｻｰﾋﾞｽ ﾄﾉ ｾﾂｿﾞｸ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify(notificationDestination, 'ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 雑談を終了する
   * @param {string} notificationDestination 通知先
   */
  async end(notificationDestination: string): Promise<void> {
    try {
      const members = await this.memberManager.getChattingMembers()
      if (members.count === 0) return

      const message = 'ｻﾞﾂﾀﾞﾝ ｼｭｳﾘｮｳ ﾉ ｼﾞｶﾝ ﾀﾞﾖ :pray:'
      await this.notifier.notify(notificationDestination, message, members)

      await this.memberManager.changeMembersStatusToUnChatting(members)
    } catch (e) {
      console.warn(e)

      if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify(notificationDestination, 'ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else if (e instanceof NotifierHandleError) {
        this.notifier.notify(notificationDestination, 'ﾂｳﾁ ｻｰﾋﾞｽ ﾄﾉ ｾﾂｿﾞｸ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify(notificationDestination, 'ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }
}
