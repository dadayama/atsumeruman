import * as functions from 'firebase-functions'
import express from 'express'
import { WebClient, LogLevel } from '@slack/web-api'
import { Atsumeruman } from './services/atsumeruman'
import { SlackMemberRepository } from './repositories/slack-member-repository'
import { SlackNotifier } from './services/slack-notifier'

const app = express()
const config = functions.config()

const client = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})
const slackMemberRepository = new SlackMemberRepository({ client })
const slackNotifier = new SlackNotifier({ client })
const atsumeruman = new Atsumeruman(slackMemberRepository, slackNotifier)

app.get('/gather', async (_, res) => {
  res.sendStatus(200)

  try {
    atsumeruman.gather(config.slack.channel, 'お知らせです')
  } catch (e) {
    res.sendStatus(500)
    console.warn(e)
  }
})

export default functions.https.onRequest(app)
