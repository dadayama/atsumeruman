import * as functions from 'firebase-functions'
import express from 'express'
import { Atsumeruman } from './services/atsumeruman'

const app = express()
const config = functions.config()
const atsumeruman = new Atsumeruman({ token: config.slack.bot_token })

app.get('/randomized', async (_, res) => {
  res.sendStatus(200)

  try {
    atsumeruman.gather(config.slack.channel, 'お知らせです')
  } catch (e) {
    res.sendStatus(500)
    console.warn(e)
  }
})

export default functions.https.onRequest(app)
