import { Word } from '../vo'

export class WordRepositoryHandleError extends Error {}

export type WordRepository = {
  getRandomly(): Promise<Word>
}
