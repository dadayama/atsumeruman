import { Container } from 'inversify'
import admin from 'firebase-admin'
import { TYPES } from './types'
import { app as slackApp } from '../dependencies'
import {
  TargetMemberRepository,
  HistoryMemberRepository,
  ChattingMemberRepository,
  FireStoreTargetMemberRepository,
  FireStoreHistoryMemberRepository,
  FireStoreChattingMemberRepository,
} from '../repositories'
import { MemberManager, ChatMemberManager, Notifier, SlackNotifier } from '../services'

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
container.bind<MemberManager>(TYPES.MemberManager).to(ChatMemberManager)
container.bind<Notifier>(TYPES.Notifier).toConstantValue(
  new SlackNotifier({
    client: slackApp.client,
  })
)

export { container }
