import Twitter from 'twitter'
import { Response } from '../utils'

/* eslint-disable camelcase */
export type TrendsResponseBody = {
  trends: {
    name: string
    url: string
    promoted_content: string | null
    query: string
    tweet_volume: number | null
  }[]
  as_of: string
  created_at: string
  locations: {
    name: string
    woeid: number
  }[]
}[]

const PLACE_ID_JP = 23424856

type Args =
  | {
      consumerKey: string
      consumerSecret: string
      accessTokenKey: string
      accessTokenSecret: string
    }
  | { api: Twitter }

export class TwitterAPI {
  private readonly api: Twitter

  constructor(args: Args) {
    if ('api' in args) {
      this.api = args.api
    } else {
      const { consumerKey, consumerSecret, accessTokenKey, accessTokenSecret } = args
      this.api = new Twitter({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        access_token_key: accessTokenKey,
        access_token_secret: accessTokenSecret,
      })
    }
  }

  async fetchTrends(placeId: number = PLACE_ID_JP): Promise<Response<TrendsResponseBody>> {
    const res = await this.api.get('trends/place', { id: placeId })
    return new Response(200, res as TrendsResponseBody)
  }
}
