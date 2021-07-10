import { Container } from 'inversify'
import admin from 'firebase-admin'
import { TYPES } from './types'
import {
  TargetMemberRepository,
  HistoryMemberRepository,
  ChattingMemberRepository,
  FireStoreTargetMemberRepository,
  FireStoreHistoryMemberRepository,
  FireStoreChattingMemberRepository,
  WordRepository,
  WikipediaWordRepository,
} from '../../repositories'

admin.initializeApp()
const fireStoreClient = admin.firestore()

const container = new Container()
container
  .bind<TargetMemberRepository>(TYPES.TargetMemberRepository)
  .toConstantValue(new FireStoreTargetMemberRepository(fireStoreClient))
container
  .bind<HistoryMemberRepository>(TYPES.HistoryMemberRepository)
  .toConstantValue(new FireStoreHistoryMemberRepository(fireStoreClient))
container
  .bind<ChattingMemberRepository>(TYPES.ChattingMemberRepository)
  .toConstantValue(new FireStoreChattingMemberRepository(fireStoreClient))
container.bind<WordRepository>(TYPES.WordRepository).to(WikipediaWordRepository)

export { container }
