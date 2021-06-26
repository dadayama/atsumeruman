import * as functions from 'firebase-functions'
import fs from 'fs'
import path from 'path'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import { WebClient, LogLevel } from '@slack/web-api'
import { App, DuplicatedMemberError, NotFoundMemberError } from './app'
import { SlackNotifier, SlackHandleError } from './services'
import { FileMemberRepository, FileHandleError, MembersData } from './repositories'

const BASE_DATA_DIR = path.join(path.resolve('./'), './data')
const CURRENT_MEMBERS_DATA_PATH = `${BASE_DATA_DIR}/current-members.json`
const HISTORY_MEMBERS_DATA_PATH = `${BASE_DATA_DIR}/history-members.json`
const INITIAL_DATA = JSON.stringify({ members: [] } as MembersData)

if (!fs.existsSync(BASE_DATA_DIR)) {
  fs.mkdirSync(BASE_DATA_DIR)
}
if (!fs.existsSync(CURRENT_MEMBERS_DATA_PATH)) {
  fs.writeFileSync(CURRENT_MEMBERS_DATA_PATH, INITIAL_DATA)
}
if (!fs.existsSync(HISTORY_MEMBERS_DATA_PATH)) {
  fs.writeFileSync(HISTORY_MEMBERS_DATA_PATH, INITIAL_DATA)
}

const currentMemberRepository = new FileMemberRepository({
  filePath: CURRENT_MEMBERS_DATA_PATH,
})
const historyMemberRepository = new FileMemberRepository({
  filePath: HISTORY_MEMBERS_DATA_PATH,
})

const config = functions.config()

const slackClient = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})
const notifier = new SlackNotifier({ client: slackClient })

const app = new App(currentMemberRepository, historyMemberRepository, notifier)

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

receiver.app.get('/gather', async (_, res) => {
  try {
    app.gather(config.slack.target_channel, config.general.number_of_target, 'ｱﾂﾏﾚｰ')

    return res.sendStatus(200)
  } catch (e) {
    console.warn(e)

    if (e instanceof FileHandleError) {
      notifier.notify(config.slack.target_channel, 'ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ ｼﾏｼﾀ !!')
    } else if (e instanceof SlackHandleError) {
      notifier.notify(config.slack.target_channel, 'Slack ﾄﾉ ｾﾂｿﾞｸ ﾆ ﾓﾝﾀﾞｲ ｶﾞ ｱﾘﾏｽ !!')
    } else {
      notifier.notify(config.slack.target_channel, `ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ ｼﾏｼﾀ !!\nｱﾂﾒﾗﾚﾏｾﾝ !!`)
    }

    return res.sendStatus(500)
  }
})

slackApp.command('/atsumeruman-join', async ({ command, ack, say, respond }) => {
  ack()

  try {
    await app.join(command.user_id, command.user_name)
  } catch (e) {
    console.warn(e)

    if (e instanceof DuplicatedMemberError) {
      respond('ｽﾃﾞﾆ ｻﾝｶｽﾞﾐ ﾃﾞｽ !!')
    } else if (e instanceof FileHandleError) {
      say('ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ ｼﾏｼﾀ !!')
    } else {
      say('ﾓﾝﾀﾞｲｶﾞ ﾊｯｾｲｼﾏｼﾀ !!')
    }

    return
  }

  say(`<@${command.user_id}>\nｻﾝｶ ｱﾘｶﾞﾄｳ !!`)
})

slackApp.command('/atsumeruman-leave', async ({ command, ack, say, respond }) => {
  ack()

  try {
    await app.leave(command.user_id, command.user_name)
  } catch (e) {
    console.warn(e)

    if (e instanceof NotFoundMemberError) {
      respond('ｻﾝｶ ｼﾃｲﾏｾﾝ !!')
    } else if (e instanceof FileHandleError) {
      say('ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ ｼﾏｼﾀ !!')
    } else {
      say('ﾓﾝﾀﾞｲｶﾞ ﾊｯｾｲｼﾏｼﾀ !!')
    }

    return
  }

  say(`<@${command.user_id}>\nﾏﾀﾈ !!`)
})

export default functions.https.onRequest(receiver.app)
