import * as functions from 'firebase-functions'
import express from 'express'
import { WebClient, LogLevel } from '@slack/web-api'
import Redis from 'ioredis'
import { AtsumeruMan, SlackNotifier } from './services'
import { SlackMemberRepository, RedisMemberRepository } from './repositories'

const app = express()
const config = functions.config()

const slackClient = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})
const currentMemberRepository = new SlackMemberRepository({ client: slackClient })
const notifier = new SlackNotifier({ client: slackClient })

const redisClient = new Redis({ host: config.redis.host, port: config.redis.port })
const redisMemberRepository = new RedisMemberRepository({ client: redisClient })

const atsumeruMan = new AtsumeruMan(currentMemberRepository, redisMemberRepository, notifier)

app.get('/gather', async (_, res) => {
  try {
    atsumeruMan.gather(
      config.slack.target_channel,
      config.general.number_of_gather_target,
      '集まりましょう！'
    )
    res.sendStatus(200)
  } catch (e) {
    res.sendStatus(500)
    console.warn(e)
  }
})

export default functions.https.onRequest(app)
