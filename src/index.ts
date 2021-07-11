import { https, pubsub } from 'firebase-functions'
import * as config from './config'
import { app as slackApp, receiver } from './utils/slack'
import { ChatController } from './controllers'

const chatController = new ChatController()

slackApp.command(
  '/atsumeruman-join',
  async ({ command: { user_id: memberId, user_name: memberName, channel_id: channelId }, ack }) => {
    ack()
    await chatController.addTargetMember(memberId, memberName, channelId)
  }
)

slackApp.command(
  '/atsumeruman-leave',
  async ({ command: { user_id: memberId, user_name: memberName, channel_id: channelId }, ack }) => {
    ack()
    await chatController.removeTargetMember(memberId, memberName, channelId)
  }
)

slackApp.command('/atsumeruman-list', async ({ command: { channel_id: channelId }, ack }) => {
  ack()
  await chatController.listTargetMembers(channelId)
})

slackApp.command(
  '/atsumeruman-topic',
  async ({ command: { user_id: memberId, user_name: memberName, channel_id: channelId }, ack }) => {
    ack()
    chatController.provideTopicRandomly(memberId, memberName, channelId)
  }
)

export const command = https.onRequest(receiver.app)

export const start = pubsub
  .schedule(config.FUNCTIONS_CRON_SCHEDULE_START)
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    await chatController.start(
      config.SLACK_TARGET_CHANNEL,
      config.NUMBER_OF_TARGET_MEMBER,
      config.VIDEO_CHAT_URL
    )
    return null
  })

export const close = pubsub
  .schedule(config.FUNCTIONS_CRON_SCHEDULE_END)
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    await chatController.end(config.SLACK_TARGET_CHANNEL)
    return null
  })
