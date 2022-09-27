import 'reflect-metadata'
import { https, pubsub } from 'firebase-functions'
import * as di from './di'
import * as config from './config'
import { app as slackApp, receiver } from './dependencies'
import { ChatController } from './controllers'
import { MemberManager, Notifier } from './services'

const memberManager = di.container.get<MemberManager>(di.TYPES.MemberManager)
const notifier = di.container.get<Notifier>(di.TYPES.Notifier)
const chatController = new ChatController(memberManager, notifier)

slackApp.command(
  '/hangar-flight',
  async ({
    command: { text: subCommand, user_id: memberId, user_name: memberName, channel_id: channelId },
    ack,
    respond,
  }) => {
    await ack()

    switch (subCommand) {
      case 'join':
        await chatController.addTargetMember(memberId, memberName, channelId)
        break
      case 'leave':
        await chatController.removeTargetMember(memberId, memberName, channelId)
        break
      case 'list':
        await chatController.listTargetMembers(channelId)
        break
      default:
        await respond("This command isn't supported.")
    }
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
