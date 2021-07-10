import { injectable } from 'inversify'
import { WikipediaAPI } from '../api'
import { SeriousWordRepository } from './serious-word-repository'
import { MediaWikiWordRepository } from './media-wiki-word-repository'

@injectable()
export class WikipediaWordRepository
  extends MediaWikiWordRepository
  implements SeriousWordRepository
{
  constructor(client: WikipediaAPI = new WikipediaAPI()) {
    super(client)
  }
}
