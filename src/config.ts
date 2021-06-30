import { config as productionConfig } from 'firebase-functions'
import localConfig from 'config'
import get from 'just-safe-get'

class UndefinedConfigValueError extends Error {}

const env = process.env.NODE_ENV ?? 'production'
const config = env === 'production' ? productionConfig() : localConfig

const getConfigValue = (key: string) => {
  const value = get(config, key)
  if (typeof value === 'undefined') {
    throw new UndefinedConfigValueError(`${key} is not defined.`)
  }
  return value
}

// export const IS_DEBUG_MODE = env !== 'production'
export const IS_DEBUG_MODE = true
export const NUMBER_OF_TARGET = getConfigValue('general.number_of_target')
export const VIDEO_CHAT_URL = getConfigValue('general.video_chat_url')
export const SLACK_SIGNING_SECRET = getConfigValue('slack.signing_secret')
export const SLACK_BOT_TOKEN = getConfigValue('slack.bot_token')
export const SLACK_TARGET_CHANNEL = getConfigValue('slack.target_channel')
