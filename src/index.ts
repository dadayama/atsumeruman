import * as functions from 'firebase-functions'
import express from 'express'
import { WebClient, LogLevel } from '@slack/web-api'
import { AtsumeruMan } from './services/atsumeru-man'
import { SlackMemberRepository } from './repositories/slack-member-repository'
import { SlackNotifier } from './services/slack-notifier'

const app = express()
const config = functions.config()

const client = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})
const slackMemberRepository = new SlackMemberRepository({ client })
const slackNotifier = new SlackNotifier({ client })
const atsumeruMan = new AtsumeruMan(slackMemberRepository, slackNotifier)

app.get('/gather', async (_, res) => {
  res.sendStatus(200)

  try {
    atsumeruMan.gather(config.slack.channel, 'お知らせです')
  } catch (e) {
    res.sendStatus(500)
    console.warn(e)
  }
})

export default functions.https.onRequest(app)
