import { Members } from '../entities'

export type MemberRepository = {
  getAll(): Promise<Members>
}
