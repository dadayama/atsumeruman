import { Container } from 'inversify'
import admin from 'firebase-admin'
import { TYPES } from './types'
import { app as slackApp, twitter } from '../dependencies'
import { TwitterAPI } from '../api'
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
  TrendRepository,
  TwitterTrendRepository,
} from '../repositories'
import {
  MemberManager,
  ChatMemberManager,
  TopicCollector,
  ChatTopicCollector,
  Notifier,
  SlackNotifier,
} from '../services'

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
container
  .bind<TrendRepository>(TYPES.TrendRepository)
  .toConstantValue(new TwitterTrendRepository(new TwitterAPI({ api: twitter })))
container.bind<MemberManager>(TYPES.MemberManager).to(ChatMemberManager)
container.bind<TopicCollector>(TYPES.TopicCollector).to(ChatTopicCollector)
container.bind<Notifier>(TYPES.Notifier).toConstantValue(
  new SlackNotifier({
    client: slackApp.client,
  })
)

export { container }
