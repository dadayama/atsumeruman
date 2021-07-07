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
export const NUMBER_OF_TARGET = getConfigValue('general.number_of_target')
export const VIDEO_CHAT_URL = getConfigValue('general.video_chat_url')
export const FUNCTIONS_CRON_SCHEDULE = getConfigValue('platform.firebase.functions.cron_schedule')
export const FIRESTORE_TARGET_MEMBERS_COLLECTION_NAME = getConfigValue(
  'platform.firebase.firestore.collection.target_members'
)
export const FIRESTORE_HISTORY_MEMBERS_COLLECTION_NAME = getConfigValue(
  'platform.firebase.firestore.collection.history_members'
)
export const SLACK_SIGNING_SECRET = getConfigValue('chat.slack.signing_secret')
export const SLACK_BOT_TOKEN = getConfigValue('chat.slack.bot_token')
export const SLACK_TARGET_CHANNEL = getConfigValue('chat.slack.target_channel')
