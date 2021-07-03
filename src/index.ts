import { https, pubsub } from 'firebase-functions'
import admin from 'firebase-admin'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import * as config from './config'
import { AtsumeruMan, DuplicatedMemberError, NotFoundMemberError } from './services/atsumeru-man'
import { SlackNotifier, NotifierHandleError } from './services'
import { FireStoreMemberRepository, MemberRepositoryHandleError } from './repositories'

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

const atsumeruMan = new AtsumeruMan({
  currentMemberRepository,
  historyMemberRepository,
})

slackApp.command(
  '/atsumeruman-join',
  async ({ command: { user_id: userId, user_name: userName }, ack, say, respond }) => {
    ack()

    try {
      await atsumeruMan.addMember(userId, userName)
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

slackApp.command(
  '/atsumeruman-leave',
  async ({ command: { user_id: userId, user_name: userName }, ack, say, respond }) => {
    ack()

    try {
      await atsumeruMan.removeMember(userId, userName)
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

slackApp.command('/atsumeruman-list', async ({ ack, say }) => {
  ack()

  try {
    const members = await atsumeruMan.getAddedMembersList()

    if (members.length) {
      const membersListString = [...members].map(({ name }) => `• *${name}*`).join('\n')
      say(`ｻﾝｶ ｼﾃｲﾙ ﾋﾄ ﾊ **${members.length}** ﾆﾝ ﾃﾞｽ :point_down:\n${membersListString}`)
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

export const command = https.onRequest(receiver.app)

export const gather = pubsub
  .schedule(config.FUNCTIONS_CRON_SCHEDULE)
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    try {
      const members = await atsumeruMan.pickMembers(config.NUMBER_OF_TARGET)
      if (members.length === 0) return

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
