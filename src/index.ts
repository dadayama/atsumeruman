import * as functions from 'firebase-functions'
import express from 'express'
import { WebClient, LogLevel } from '@slack/web-api'
import { TARGET_CHANNEL } from './config'

const app = express()
const config = functions.config()
const client = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})

app.get('/notify', (_, res) => {
  res.sendStatus(200)

  try {
    client.chat.postMessage({
      channel: TARGET_CHANNEL,
      text: '<!channel>\nお知らせです',
    })
  } catch (e) {
    console.warn(e)
  }
})

export default functions.region('asia-northeast1').https.onRequest(app)
