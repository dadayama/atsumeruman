import { firestore } from 'firebase-admin'
import { FireStoreMemberRepository } from './firestore-member-repository'

export class FireStoreHistoryMemberRepository extends FireStoreMemberRepository {
  constructor(client?: firestore.Firestore) {
    super('HistoryMembers', client)
  }
}
