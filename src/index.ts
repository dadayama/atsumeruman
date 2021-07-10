import { https, pubsub } from 'firebase-functions'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import * as config from './config'
import {
  ChatMemberManager,
  ChatTopics,
  SlackNotifier,
  DuplicatedMemberError,
  NotFoundMemberError,
  NotifierHandleError,
} from './services'
import { MemberRepositoryHandleError, WordRepositoryHandleError } from './repositories'

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

const chatMemberManager = new ChatMemberManager()
const chatTopics = new ChatTopics()

const notifier = new SlackNotifier({
  channel: config.SLACK_TARGET_CHANNEL,
  client: slackApp.client,
})

/**
 * コマンドを打ったメンバーを雑談の招集対象にする
 */
slackApp.command(
  '/atsumeruman-join',
  async ({ command: { user_id: userId, user_name: userName }, ack, say, respond }) => {
    ack()

    try {
      await chatMemberManager.addTargetMember(userId, userName)
      say(`<@${userId}>\nｻﾝｶ ｱﾘｶﾞﾄ :tada:`)
    } catch (e) {
      console.warn(e)

      if (e instanceof DuplicatedMemberError) {
        respond('ｻﾝｶ ｽﾞﾐ :+1:')
      } else if (e instanceof MemberRepositoryHandleError) {
        say('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        say('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }
)

/**
 * コマンドを打ったメンバーを雑談の招集対象から外す
 */
slackApp.command(
  '/atsumeruman-leave',
  async ({ command: { user_id: userId, user_name: userName }, ack, say, respond }) => {
    ack()

    try {
      await chatMemberManager.removeTargetMember(userId, userName)
      say(`<@${userId}>\nﾊﾞｲﾊﾞｲ :wave:`)
    } catch (e) {
      console.warn(e)

      if (e instanceof NotFoundMemberError) {
        respond('ｻﾝｶ ｼﾃ ｲﾅｲ :facepunch:')
      } else if (e instanceof MemberRepositoryHandleError) {
        say('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        say('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
  }
)

/**
 * 雑談の招集対象メンバーの一覧を見る
 */
slackApp.command('/atsumeruman-list', async ({ ack, say }) => {
  ack()

  try {
    const members = await chatMemberManager.getTargetMembers()

    if (members.count) {
      const membersListString = [...members].map(({ name }) => `• *${name}*`).join('\n')
      say({
        text: `ｻﾝｶ ｼﾃｲﾙ ﾋﾄ ﾊ *${members.count}* ﾆﾝ ﾃﾞｽ :point_down:\n${membersListString}`,
        mrkdwn: true,
      })
    } else {
      say('ﾀﾞﾚﾓ ｻﾝｶ ｼﾃ ｲﾅｲ :anger:')
    }
  } catch (e) {
    console.warn(e)

    if (e instanceof MemberRepositoryHandleError) {
      say('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
    } else {
      say('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
    }
  }
})

/**
 * 雑談ネタを提供する
 */
slackApp.command('/atsumeruman-topic', async ({ ack, say }) => {
  ack()

  try {
    const topic = await chatTopics.getTopicRandomly()
    say({
      text: `「<${topic.descriptionUrl}|*${topic.title}*>」ｦ ﾂｶｯﾃ ﾊﾅｼ ｦ ﾓﾘｱｹﾞﾖｳ :raised_hands:`,
      mrkdwn: true,
    })
  } catch (e) {
    console.warn(e)

    if (e instanceof WordRepositoryHandleError) {
      say('ﾄﾋﾟｯｸ ﾉ ｼｭﾄｸ ﾆ ｼｯﾊﾟｲ :innocent:')
    } else {
      say('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
    }
  }
})

export const command = https.onRequest(receiver.app)

export const convene = pubsub
  .schedule(config.FUNCTIONS_CRON_SCHEDULE_START)
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      const members = await chatMemberManager.pickMembers(config.NUMBER_OF_TARGET)
      if (members.count === 0) return

      const message = `ｻﾞﾂﾀﾞﾝ ﾉ ｼﾞｶﾝ ﾀﾞﾖ\nｱﾂﾏﾚｰ :clap:\n${config.VIDEO_CHAT_URL}`
      await notifier.notify(message, members)
    } catch (e) {
      console.warn(e)

      if (e instanceof MemberRepositoryHandleError) {
        notifier.notify('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else if (e instanceof NotifierHandleError) {
        notifier.notify('ﾂｳﾁ ｻｰﾋﾞｽ ﾄﾉ ｾﾂｿﾞｸ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        notifier.notify('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
    return null
  })

export const dismiss = pubsub
  .schedule(config.FUNCTIONS_CRON_SCHEDULE_END)
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      const members = await chatMemberManager.getChattingMembers()
      if (members.count === 0) return

      const message = 'ｻﾞﾂﾀﾞﾝ ｼｭｳﾘｮｳ ﾉ ｼﾞｶﾝ ﾀﾞﾖ :pray:'
      await notifier.notify(message, members)
    } catch (e) {
      console.warn(e)

      if (e instanceof MemberRepositoryHandleError) {
        notifier.notify('ﾒﾝﾊﾞｰ ﾃﾞｰﾀ ﾉ ｼｭﾄｸ･ｺｳｼﾝ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else if (e instanceof NotifierHandleError) {
        notifier.notify('ﾂｳﾁ ｻｰﾋﾞｽ ﾄﾉ ｾﾂｿﾞｸ ﾆ ｼｯﾊﾟｲ :innocent:')
      } else {
        notifier.notify('ﾓﾝﾀﾞｲ ｶﾞ ﾊｯｾｲ :ladybug:')
      }
    }
    return null
  })
