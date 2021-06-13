import * as functions from 'firebase-functions'
import express from 'express'
import { WebClient, LogLevel } from '@slack/web-api'

const app = express()
const config = functions.config()
const client = new WebClient(config.slack.bot_token, {
  logLevel: LogLevel.DEBUG,
})

app.get('/notify', async (_, res) => {
  res.sendStatus(200)

  try {
    const users = await client.users.list()
    const targetUsers = users.members
      ? users.members.filter((user) => !user.is_bot && !user.deleted)
      : []

    const mention = targetUsers.map((targetUser) => `<@${targetUser.id}>`).join(' ')
    const text = `${mention}\nお知らせです`

    client.chat.postMessage({
      channel: config.slack.channel,
      text,
    })
  } catch (e) {
    console.warn(e)
  }
})

export default functions.https.onRequest(app)
