import { firestore } from 'firebase-admin'
import { FireStoreMemberRepository } from './firestore-member-repository'

export class FireStoreChattingMemberRepository extends FireStoreMemberRepository {
  constructor(client?: firestore.Firestore) {
    super('ChattingMembers', client)
  }
}
