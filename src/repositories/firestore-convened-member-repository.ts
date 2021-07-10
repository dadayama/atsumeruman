import { firestore } from 'firebase-admin'
import { injectable } from 'inversify'
import { FireStoreMemberRepository } from './firestore-member-repository'

@injectable()
export class FireStoreConvenedMemberRepository extends FireStoreMemberRepository {
  constructor(client?: firestore.Firestore) {
    super('convenedMembers', client)
  }
}
