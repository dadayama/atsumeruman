import * as functions from 'firebase-functions'
import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import { WebClient, LogLevel } from '@slack/web-api'
import Redis from 'ioredis'
import { AtsumeruMan, SlackNotifier, SlackHandleError } from './services'
import { RedisMemberRepository, RedisHandleError } from './repositories'

const config = functions.config()

const redisClientForCurrentMember = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db.current_member,
})
const currentMemberRepository = new RedisMemberRepository({ client: redisClientForCurrentMember })
const redisClientForHistoryMember = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db.history_member,
})
const historyMemberRepository = new RedisMemberRepository({ client: redisClientForHistoryMember })

const slackClient = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})
const notifier = new SlackNotifier({ client: slackClient })

const atsumeruMan = new AtsumeruMan(currentMemberRepository, historyMemberRepository, notifier)

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
    atsumeruMan.gather(config.slack.target_channel, config.general.number_of_target, 'ｱﾂﾏﾚｰ')

    return res.sendStatus(200)
  } catch (e) {
    if (e instanceof RedisHandleError) {
      notifier.notify(config.slack.target_channel, 'Redis ﾆ ﾓﾝﾀﾞｲｶﾞ ｱﾘﾏｽ !!')
    } else if (e instanceof SlackHandleError) {
      notifier.notify(config.slack.target_channel, 'Slack ﾆ ﾓﾝﾀﾞｲｶﾞ ｱﾘﾏｽ !!')
    } else {
      notifier.notify(config.slack.target_channel, `ﾓﾝﾀﾞｲｶﾞ ﾊｯｾｲｼﾏｼﾀ !!\nｱﾂﾒﾗﾚﾏｾﾝ !!`)
    }

    console.warn(e)
    return res.sendStatus(500)
  }
})

slackApp.command('/atsumeruman-join', async ({ command, ack, say, respond }) => {
  ack()

  try {
    const hasBeenJoined = await atsumeruMan.hasBeenJoined(command.user_id)
    if (hasBeenJoined) {
      respond('ｽﾃﾞﾆ ｻﾝｶｽﾞﾐ ﾃﾞｽ !!')
      return
    }

    await atsumeruMan.join(command.user_id)
  } catch (e) {
    console.warn(e)

    if (e instanceof RedisHandleError) {
      say('Redis ﾆ ﾓﾝﾀﾞｲｶﾞ ｱﾘﾏｽ !!')
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
    const hasBeenJoined = await atsumeruMan.hasBeenJoined(command.user_id)
    if (!hasBeenJoined) {
      respond('ｻﾝｶ ｼﾃｲﾏｾﾝ !!')
      return
    }

    await atsumeruMan.leave(command.user_id)
  } catch (e) {
    console.warn(e)

    if (e instanceof RedisHandleError) {
      say('Redis ﾆ ﾓﾝﾀﾞｲｶﾞ ｱﾘﾏｽ !!')
    } else {
      say('ﾓﾝﾀﾞｲｶﾞ ﾊｯｾｲｼﾏｼﾀ !!')
    }

    return
  }

  say(`<@${command.user_id}>\nﾏﾀﾈ !!`)
})

export default functions.https.onRequest(receiver.app)
