import { injectable } from 'inversify'
import { UnCyclopediaAPI } from '../api'
import { FoolishWordRepository } from './foolish-word-repository'
import { MediaWikiWordRepository } from './media-wiki-word-repository'

@injectable()
export class UnCyclopediaWordRepository
  extends MediaWikiWordRepository
  implements FoolishWordRepository
{
  constructor(client: UnCyclopediaAPI = new UnCyclopediaAPI()) {
    super(client)
  }
}
