import { firestore } from 'firebase-admin'
import { Member, Members } from '../entities'
import { MemberRepository, MemberRepositoryHandleError } from './member-repository'

type MemberDoc = {
  name: string
}

function assertMemberDoc(data: firestore.DocumentData): asserts data is MemberDoc {
  if (typeof data?.name !== 'string') {
    throw new Error('Data is not a Member type.')
  }
}

const memberDocConverter: firestore.FirestoreDataConverter<MemberDoc> = {
  fromFirestore(snapShot: firestore.QueryDocumentSnapshot): MemberDoc {
    const data = snapShot.data()
    assertMemberDoc(data)
    return data
  },
  toFirestore: (data: MemberDoc) => data,
}

export class FireStoreMemberRepository implements MemberRepository {
  private readonly collectionName: string
  private readonly client: firestore.Firestore

  constructor({ collectionName, client }: { collectionName: string; client: firestore.Firestore }) {
    this.collectionName = collectionName
    this.client = client
  }

  async getAll(): Promise<Members> {
    try {
      const args: Member[] = []
      const snapShot = await this.client
        .collection(this.collectionName)
        .withConverter(memberDocConverter)
        .get()
      snapShot.forEach((doc) => {
        const { name } = doc.data()
        args.push(new Member(doc.id, name))
      })
      return new Members(args)
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to get the member data.')
    }
  }

  async findById(memberId: string): Promise<Member | undefined> {
    try {
      const doc = await this.client
        .collection(this.collectionName)
        .withConverter(memberDocConverter)
        .doc(memberId)
        .get()
      const data = doc.data()
      return data ? new Member(memberId, data.name) : undefined
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to find the member data.')
    }
  }

  async add(members: Member | Members): Promise<void> {
    try {
      const batch = this.client.batch()
      const _members = members instanceof Member ? [{ ...members }] : [...members]

      _members.forEach(({ id, name }) => {
        const docRef = this.client
          .collection(this.collectionName)
          .withConverter(memberDocConverter)
          .doc(id)
        batch.set(docRef, { name })
      })

      await batch.commit()
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to add the members data.')
    }
  }

  async remove(members: Member | Members): Promise<void> {
    try {
      const batch = this.client.batch()
      const _members = members instanceof Member ? [{ ...members }] : [...members]

      _members.forEach(({ id }) => {
        const docRef = this.client
          .collection(this.collectionName)
          .withConverter(memberDocConverter)
          .doc(id)
        batch.delete(docRef)
      })

      await batch.commit()
    } catch (e) {
      throw new MemberRepositoryHandleError(e?.message || 'Failed to remove the members data.')
    }
  }
}
