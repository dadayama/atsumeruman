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
  SeriousWordRepository,
  FoolishWordRepository,
  WikipediaWordRepository,
  UnCyclopediaWordRepository,
} from '../../repositories'

admin.initializeApp()
const fireStoreClient = admin.firestore()

const container = new Container({ skipBaseClassChecks: true })
container
  .bind<TargetMemberRepository>(TYPES.TargetMemberRepository)
  .toConstantValue(new FireStoreTargetMemberRepository(fireStoreClient))
container
  .bind<HistoryMemberRepository>(TYPES.HistoryMemberRepository)
  .toConstantValue(new FireStoreHistoryMemberRepository(fireStoreClient))
container
  .bind<ChattingMemberRepository>(TYPES.ChattingMemberRepository)
  .toConstantValue(new FireStoreChattingMemberRepository(fireStoreClient))
container.bind<SeriousWordRepository>(TYPES.SeriousWordRepository).to(WikipediaWordRepository)
container.bind<FoolishWordRepository>(TYPES.FoolishWordRepository).to(UnCyclopediaWordRepository)

export { container }