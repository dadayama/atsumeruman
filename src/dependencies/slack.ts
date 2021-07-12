import { App as SlackApp, ExpressReceiver } from '@slack/bolt'
import * as config from '../config'

const receiver = new ExpressReceiver({
  signingSecret: config.SLACK_SIGNING_SECRET,
  endpoints: '/',
  processBeforeResponse: true,
})
const app = new SlackApp({
  receiver,
  token: config.SLACK_BOT_TOKEN,
  processBeforeResponse: true,
})

export { receiver, app }
