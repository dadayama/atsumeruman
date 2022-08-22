import { https, pubsub } from 'firebase-functions'
import * as config from './config'
import { app as slackApp, receiver } from './dependencies'
import { ChatController } from './controllers'

const chatController = new ChatController()

slackApp.command(
  '/hangar-flight-join',
  async ({ command: { user_id: memberId, user_name: memberName, channel_id: channelId }, ack }) => {
    ack()
    await chatController.addTargetMember(memberId, memberName, channelId)
  }
)

slackApp.command(
  '/hangar-flight-leave',
  async ({ command: { user_id: memberId, user_name: memberName, channel_id: channelId }, ack }) => {
    ack()
    await chatController.removeTargetMember(memberId, memberName, channelId)
  }
)

slackApp.command('/hangar-flight-list', async ({ command: { channel_id: channelId }, ack }) => {
  ack()
  await chatController.listTargetMembers(channelId)
})

slackApp.command(
  '/hangar-flight-topic',
  async ({
    command: { user_id: memberId, user_name: memberName, channel_id: channelId, text: type },
    ack,
  }) => {
    ack()
    chatController.provideTopicRandomly(memberId, memberName, channelId, type)
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
