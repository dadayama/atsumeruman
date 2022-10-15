import { Member, Members } from '../entities'
import {
  TargetMemberRepository,
  HistoryMemberRepository,
  ChattingMemberRepository,
} from '../repositories'
import { MemberManager, DuplicatedMemberError, NotFoundMemberError } from './member-manager'

/**
 * 雑談のメンバーを管理する
 */
export class ChatMemberManager implements MemberManager {
  constructor(
    private readonly targetMemberRepository: TargetMemberRepository,
    private readonly historyMemberRepository: HistoryMemberRepository,
    private readonly chattingMemberRepository: ChattingMemberRepository
  ) {}

  /**
   * メンバーを雑談開始時に招集する対象に追加する
   * @param {Member} member 対象メンバー
   */
  async addTargetMember(member: Member): Promise<void> {
    const hasBeenAdded = await this.hasBeenAdded(member)
    if (hasBeenAdded) {
      throw new DuplicatedMemberError('Member have already joined.')
    }

    await this.targetMemberRepository.add(member)
  }

  /**
   * メンバーを雑談開始時に招集する対象から削除する
   * @param {Member} member 対象メンバー
   */
  async removeTargetMember(member: Member): Promise<void> {
    const hasBeenAdded = await this.hasBeenAdded(member)
    if (!hasBeenAdded) {
      throw new NotFoundMemberError('Member have not joined')
    }

    await this.targetMemberRepository.remove(member)
  }

  /**
   * 雑談の招集対象となるメンバー一覧を取得する
   */
  async getTargetMembers(): Promise<Members> {
    return await this.targetMemberRepository.getAll()
  }

  /**
   * 雑談中のメンバー一覧を取得する
   */
  async getChattingMembers(): Promise<Members> {
    return await this.chattingMemberRepository.getAll()
  }

  /**
   * 招集履歴に存在するメンバー一覧を取得する
   */
  async getHistoryMembers(): Promise<Members> {
    return await this.historyMemberRepository.getAll()
  }

  /**
   * 雑談の招集対象のメンバーをランダムに取得する
   * 現在のメンバー一覧と招集履歴を突き合わせ、可能な限り履歴に存在しないメンバーを選ぶ
   * @param {number} numberOfTargetMember 取得人数
   * @param {Members} historyMembers 招集履歴に存在するメンバー
   */
  async pickTargetMembersRandomly(
    numberOfTargetMember: number,
    historyMembers: Members = new Members()
  ): Promise<Members> {
    const targetMembers = await this.getTargetMembers()

    // 現在のメンバー一覧から招集履歴に存在しないメンバーを抽出する
    const membersNotInHistory = targetMembers.remove(historyMembers)

    // 取得人数を（可能な限り）満たすメンバー一覧をランダムに取得する
    const pickedMembers = await membersNotInHistory.pickRandomlyToFill(
      numberOfTargetMember,
      targetMembers
    )

    return pickedMembers
  }

  async addHistory(members: Members): Promise<void> {
    await this.historyMemberRepository.add(members)
  }

  async flushHistory(): Promise<void> {
    const historyMembers = await this.getHistoryMembers()
    await this.historyMemberRepository.remove(historyMembers)
  }

  /**
   * 対象のメンバーを雑談中の状態に設定する
   * @param {Members} members 雑談中の状態に設定したいメンバー
   */
  async changeMembersStatusToChatting(members: Members): Promise<void> {
    await this.chattingMemberRepository.add(members)
  }

  /**
   * 対象のメンバーを雑談中の状態から外す
   * @param {Members} members 雑談中の状態から外したいメンバー
   */
  async changeMembersStatusToUnChatting(members: Members): Promise<void> {
    await this.chattingMemberRepository.remove(members)
  }

  /**
   * 雑談中の状態に設定されているメンバー全ての雑談中の状態を外す
   */
  async releaseChattingStatusFromMembers(): Promise<void> {
    const chattingMembers = await this.getChattingMembers()
    await this.changeMembersStatusToUnChatting(chattingMembers)
  }

  private async hasBeenAdded(member: Member): Promise<boolean> {
    const _member = await this.targetMemberRepository.findById(member.id)
    return !!_member
  }
}
