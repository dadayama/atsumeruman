import { Word } from '../entities'

export class WordRepositoryHandleError extends Error {}

export type WordRepository = {
  getRandomly(): Promise<Word>
}
