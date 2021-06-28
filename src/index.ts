import * as functions from 'firebase-functions'
import fs from 'fs'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import { WebClient, LogLevel } from '@slack/web-api'
import { App } from './app'
import { SlackNotifier } from './services'
import { FileMemberRepository, MembersData } from './repositories'

const config = functions.config()

const BASE_DATA_DIR = '/tmp'
const CURRENT_MEMBERS_DATA_PATH = `${BASE_DATA_DIR}/current-members.json`
const HISTORY_MEMBERS_DATA_PATH = `${BASE_DATA_DIR}/history-members.json`

const initialize = (): void => {
  const initialData = JSON.stringify({ members: [] } as MembersData)

  if (!fs.existsSync(CURRENT_MEMBERS_DATA_PATH)) {
    fs.writeFileSync(CURRENT_MEMBERS_DATA_PATH, initialData)
  }
  if (!fs.existsSync(HISTORY_MEMBERS_DATA_PATH)) {
    fs.writeFileSync(HISTORY_MEMBERS_DATA_PATH, initialData)
  }
}

const createApp = (): App => {
  const currentMemberRepository = new FileMemberRepository({
    filePath: CURRENT_MEMBERS_DATA_PATH,
  })
  const historyMemberRepository = new FileMemberRepository({
    filePath: HISTORY_MEMBERS_DATA_PATH,
  })

  const slackClient = new WebClient(config.slack.bot_token, {
    logLevel: LogLevel.DEBUG,
  })
  const notifier = new SlackNotifier({ channel: config.slack.target_channel, client: slackClient })

  return new App({
    numberOfTarget: config.general.number_of_target,
    urlToGather: config.general.video_chat_url,
    currentMemberRepository,
    historyMemberRepository,
    notifier,
  })
}

initialize()

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

slackApp.command('/atsumeruman-join', async ({ command, ack, say, respond }) => {
  ack()
  await app.join(command.user_id, command.user_name)
})

slackApp.command('/atsumeruman-leave', async ({ command, ack, say, respond }) => {
  ack()
  await app.leave(command.user_id, command.user_name)
})

export const command = functions.https.onRequest(receiver.app)

export const cron = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    await app.gather()
    return null
  })
