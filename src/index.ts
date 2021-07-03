import { https, pubsub } from 'firebase-functions'
import admin from 'firebase-admin'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import * as config from './config'
import { App } from './app'
import { SlackNotifier } from './services'
import { FireStoreMemberRepository } from './repositories'

const receiver = new ExpressReceiver({
  signingSecret: config.SLACK_SIGNING_SECRET,
  endpoints: '/',
  processBeforeResponse: true,
})
const slackApp = new SlackApp({
  receiver,
  token: config.SLACK_BOT_TOKEN,
  processBeforeResponse: true,
})

const createApp = (): App => {
  admin.initializeApp()
  const fireStoreClient = admin.firestore()
  const currentMemberRepository = new FireStoreMemberRepository({
    collectionName: config.FIRESTORE_CURRENT_MEMBERS_COLLECTION_NAME,
    client: fireStoreClient,
  })
  const historyMemberRepository = new FireStoreMemberRepository({
    collectionName: config.FIRESTORE_HISTORY_MEMBERS_COLLECTION_NAME,
    client: fireStoreClient,
  })

  const notifier = new SlackNotifier({
    channel: config.SLACK_TARGET_CHANNEL,
    client: slackApp.client,
  })

  return new App({
    numberOfTarget: config.NUMBER_OF_TARGET,
    videoChatURL: config.VIDEO_CHAT_URL,
    currentMemberRepository,
    historyMemberRepository,
    notifier,
  })
}

const app = createApp()

slackApp.command('/atsumeruman-join', async ({ command, ack }) => {
  ack()
  await app.joinMember(command.user_id, command.user_name)
})

slackApp.command('/atsumeruman-leave', async ({ command, ack }) => {
  ack()
  await app.leaveMember(command.user_id, command.user_name)
})

slackApp.command('/atsumeruman-list', async ({ ack }) => {
  ack()
  await app.listJoinedMembers()
})

export const command = https.onRequest(receiver.app)

export const cron = pubsub
  .schedule(config.FUNCTIONS_CRON_SCHEDULE)
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    await app.gather()
    return null
  })

// ローカル開発時にデバッグできるよう、HTTP経由でのアクセスを可能にしておく
if (config.IS_DEBUG_MODE) {
  receiver.app.get('/join', async (req, res) => {
    const {
      query: { user_id: userId, user_name: userName },
    } = req
    if (typeof userId !== 'string' || typeof userName !== 'string') {
      res.sendStatus(400)
    }

    try {
      await app.joinMember(userId as string, userName as string)
      res.sendStatus(201)
    } catch (e) {
      res.status(500).json(e.message)
    }
  })

  receiver.app.get('/leave', async (req, res) => {
    const {
      query: { user_id: userId, user_name: userName },
    } = req
    if (typeof userId !== 'string' || typeof userName !== 'string') {
      res.sendStatus(400)
    }

    try {
      await app.leaveMember(userId as string, userName as string)
      res.sendStatus(204)
    } catch (e) {
      res.status(500).json(e.message)
    }
  })

  receiver.app.get('/list', async (_, res) => {
    try {
      await app.listJoinedMembers()
      res.sendStatus(200)
    } catch (e) {
      res.status(500).json(e.message)
    }
  })

  receiver.app.get('/gather', async (_, res) => {
    try {
      await app.gather()
      res.sendStatus(200)
    } catch (e) {
      res.status(500).json(e.message)
    }
  })
}
