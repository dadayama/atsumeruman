import { firestore } from 'firebase-admin'
import { FireStoreMemberRepository } from './firestore-member-repository'

export class FireStoreTargetMemberRepository extends FireStoreMemberRepository {
  constructor(client?: firestore.Firestore) {
    super('TargetMembers', client)
  }
}
