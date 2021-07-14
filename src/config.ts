import { config } from 'firebase-functions'
import get from 'just-safe-get'

class UndefinedConfigValueError extends Error {}

const getConfigValue = (key: string) => {
  const value = get(config(), key)
  if (typeof value === 'undefined') {
    throw new UndefinedConfigValueError(`${key} is not defined.`)
  }
  return value
}

export const IS_DEBUG_MODE = process.env.NODE_ENV !== 'production'
export const NUMBER_OF_TARGET_MEMBER = getConfigValue('general.number_of_target_member')
export const VIDEO_CHAT_URL = getConfigValue('general.video_chat_url')
export const FUNCTIONS_CRON_SCHEDULE_START = getConfigValue(
  'platform.firebase.functions.cron_schedule_start'
)
export const FUNCTIONS_CRON_SCHEDULE_END = getConfigValue(
  'platform.firebase.functions.cron_schedule_end'
)
export const SLACK_SIGNING_SECRET = getConfigValue('chat.slack.signing_secret')
export const SLACK_BOT_TOKEN = getConfigValue('chat.slack.bot_token')
export const SLACK_TARGET_CHANNEL = getConfigValue('chat.slack.target_channel')
export const TWITTER_CONSUMER_KEY = getConfigValue('api.twitter.consumer_key')
export const TWITTER_CONSUMER_SECRET = getConfigValue('api.twitter.consumer_secret')
export const TWITTER_ACCESS_TOKEN_KEY = getConfigValue('api.twitter.access_token_key')
export const TWITTER_ACCESS_TOKEN_SECRET = getConfigValue('api.twitter.access_token_secret')
