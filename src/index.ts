import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { App } from './app'
import { SlackNotifier } from './services'
import { FireStoreMemberRepository } from './repositories'

const config = functions.config()

const createApp = (): App => {
  admin.initializeApp()
  const client = admin.firestore()
  const currentMemberRepository = new FireStoreMemberRepository('current', client)
  const historyMemberRepository = new FireStoreMemberRepository('history', client)

  const slackClient = new WebClient(config.slack.bot_token)
  const notifier = new SlackNotifier({ channel: config.slack.target_channel, client: slackClient })

  return new App({
    numberOfTarget: config.general.number_of_target,
    urlToGather: config.general.video_chat_url,
    currentMemberRepository,
    historyMemberRepository,
    notifier,
  })
}

const app = createApp()

const receiver = new ExpressReceiver({
  signingSecret: config.slack.signing_secret,
  endpoints: '/',
  processBeforeResponse: true,
})
const slackApp = new SlackApp({
  receiver,
  token: config.slack.bot_token,
  processBeforeResponse: true,
})

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

export const command = functions.https.onRequest(receiver.app)

export const cron = functions.pubsub
  .schedule('0 15 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    await app.gather()
    return null
  })
