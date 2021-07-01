import { Member, Members } from './entities'
import { MemberRepository, MemberRepositoryHandleError } from './repositories'
import { Notifier, NotifierHandleError } from './services'

export class DuplicatedMemberError extends Error {}
export class NotFoundMemberError extends Error {}

export class App {
  private readonly videoChatURL: string
  private readonly numberOfTarget: number
  private readonly currentMemberRepository: MemberRepository
  private readonly historyMemberRepository: MemberRepository
  private readonly notifier: Notifier

  constructor({
    videoChatURL,
    numberOfTarget,
    currentMemberRepository,
    historyMemberRepository,
    notifier,
  }: {
    videoChatURL: string
    numberOfTarget: number
    currentMemberRepository: MemberRepository
    historyMemberRepository: MemberRepository
    notifier: Notifier
  }) {
    this.videoChatURL = videoChatURL
    this.numberOfTarget = numberOfTarget
    this.currentMemberRepository = currentMemberRepository
    this.historyMemberRepository = historyMemberRepository
    this.notifier = notifier
  }

  /**
   * 招集対象メンバーをランダムに取得し、通知を送る
   */
  async gather(): Promise<void> {
    try {
      const targetMembers = await this.pickMembers(this.numberOfTarget)
      if (targetMembers.length === 0) return

      const message = `ｻﾞﾂﾀﾞﾝ ﾉ ｼﾞｶﾝ ﾀﾞﾖ\nｱﾂﾏﾚｰ :clap:\n${this.videoChatURL}`
      await this.notifier.notify(message, targetMembers)
    } catch (e) {
      console.warn(e)

      if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else if (e instanceof NotifierHandleError) {
        this.notifier.notify('ﾂｳﾁ ｻｰﾋﾞｽ ﾄﾉ ｾﾂｿﾞｸ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 招集対象メンバーに追加する
   * @param {string} memberId メンバーID
   * @param {string} memberName メンバー名
   */
  async joinMember(memberId: string, memberName: string): Promise<void> {
    const member = new Member(memberId, memberName)

    try {
      const hasBeenJoined = await this.hasBeenJoined(member)
      if (hasBeenJoined) {
        throw new DuplicatedMemberError('Member have already joined.')
      }

      await this.currentMemberRepository.add(member)
      this.notifier.notify('ｻﾝｶ ｱﾘｶﾞﾄ :tada:', member)
    } catch (e) {
      console.warn(e)

      if (e instanceof DuplicatedMemberError) {
        this.notifier.notifySecretly('ｻﾝｶ ｽﾞﾐ :+1:', member)
      } else if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 招集対象メンバーから削除する
   * @param {string} memberId メンバーID
   * @param {string} memberName メンバー名
   */
  async leaveMember(memberId: string, memberName: string): Promise<void> {
    const member = new Member(memberId, memberName)

    try {
      const hasBeenJoined = await this.hasBeenJoined(member)
      if (!hasBeenJoined) {
        throw new NotFoundMemberError('Member have not joined')
      }

      await this.currentMemberRepository.remove(member)
      this.notifier.notify('ﾊﾞｲﾊﾞｲ :wave:', member)
    } catch (e) {
      console.warn(e)

      if (e instanceof NotFoundMemberError) {
        this.notifier.notifySecretly('ｻﾝｶ ｼﾃ ｲﾅｲ :facepunch:', member)
      } else if (e instanceof MemberRepositoryHandleError) {
        this.notifier.notify('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        this.notifier.notify('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }

  /**
   * 招集対象メンバー一覧を表示する
   */
  async listJoinedMembers(): Promise<void> {
    const members = await this.currentMemberRepository.getAll()
    let message: string

    if (members.length) {
      const membersString = [...members].map((member) => `• *${member.name}*`).join('\n')
      message = `ｻﾝｶ ｼﾃｲﾙ ﾋﾄ ﾊ ${members.length} ﾆﾝ ﾃﾞｽ :point_down:\n${membersString}`
    } else {
      message = 'ﾀﾞﾚﾓ ｻﾝｶ ｼﾃ ｲﾅｲ :anger:'
    }

    this.notifier.notify(message)
  }

  /**
   * 招集対象メンバーの有無を確認する
   * @param {string} member メンバー
   */
  private async hasBeenJoined(member: Member): Promise<boolean> {
    const _member = await this.currentMemberRepository.findById(member.id)
    return !!_member
  }

  /**
   * 招集対象メンバーをランダムに取得する
   * 現在のメンバー一覧と招集履歴を突き合わせ、可能な限り履歴に存在しないメンバーを選ぶ
   * @param {number} numberOfTargetMember 取得人数
   */
  async pickMembers(numberOfTargetMember: number): Promise<Members> {
    const currentMembers = await this.currentMemberRepository.getAll()
    const gatheredMembers = await this.historyMemberRepository.getAll()

    // 現在のメンバー一覧から、招集履歴に存在しないメンバーのみを抽出する
    let targetMembers = currentMembers.remove(gatheredMembers)
    const numberOfMember = targetMembers.length

    if (numberOfMember > numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を上回る場合、抽出したメンバーからさらにランダムに取得人数分だけ抽出する
      targetMembers = targetMembers.pickRandomized(numberOfTargetMember)
    } else if (numberOfMember < numberOfTargetMember) {
      // 招集履歴に存在しないメンバーの数が取得人数を下回る場合、現在のメンバー一覧から不足分を抽出して補う
      const numberToAdd = numberOfTargetMember - numberOfMember
      targetMembers = targetMembers.add(
        currentMembers.remove(targetMembers).pickRandomized(numberToAdd)
      )
      // 記録が埋まるので全記録をクリアする
      await this.historyMemberRepository.remove(gatheredMembers)
    }

    await this.historyMemberRepository.add(targetMembers)

    return targetMembers
  }
}
