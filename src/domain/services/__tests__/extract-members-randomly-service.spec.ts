import { Member, Members } from '../../../entities'
import { IExtractMembersRandomlyService, ExtractMembersRandomlyService } from '..'

describe('ExtractMembersRandomlyService', () => {
  let extractMembersRandomlyService: IExtractMembersRandomlyService

  beforeEach(() => {
    extractMembersRandomlyService = new ExtractMembersRandomlyService()
  })

  describe('execute()', () => {
    it('randomly extracts a specified number of members from a given list of members', () => {
      const members = new Members([
        new Member('1', 'foo'),
        new Member('2', 'bar'),
        new Member('3', 'baz'),
        new Member('4', 'qux'),
        new Member('5', 'quux'),
      ])
      const extracted = extractMembersRandomlyService.execute(members, 3)

      expect(extracted.count).toStrictEqual(3)
      expect([...members]).toEqual(expect.arrayContaining([...extracted]))
    })

    it('returns a list of members if the number of members in the given list is less than the number specified', () => {
      const members = new Members([new Member('1', 'foo'), new Member('2', 'bar')])
      const extracted = extractMembersRandomlyService.execute(members, 3)

      expect(extracted.count).toStrictEqual(2)
      expect([...members]).toEqual(expect.arrayContaining([...extracted]))
    })

    it('subtracts the exclusions from the given list of members and then randomly extracts a specified number of people', () => {
      const members = new Members([
        new Member('1', 'foo'),
        new Member('2', 'bar'),
        new Member('3', 'baz'),
        new Member('4', 'qux'),
        new Member('5', 'quux'),
      ])
      const excluded = new Members([
        new Member('1', 'foo'),
        new Member('3', 'baz'),
        new Member('5', 'quux'),
      ])
      const extracted = extractMembersRandomlyService.execute(members, 3, excluded)

      expect(extracted.count).toStrictEqual(3)
      expect([...members]).toEqual(expect.arrayContaining([...extracted]))
    })
  })
})
