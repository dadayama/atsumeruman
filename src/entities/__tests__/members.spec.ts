import { Member, Members } from '..'

describe('Members', () => {
  let members: Members

  beforeEach(() => {
    members = new Members()
  })

  describe('create()', () => {
    it('create Members from parameters', () => {
      const members = Members.create([
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
        { id: '3', name: 'baz' },
      ])

      expect(members.count).toStrictEqual(3)
      expect([...members]).toStrictEqual([
        new Member('1', 'foo'),
        new Member('2', 'bar'),
        new Member('3', 'baz'),
      ])
    })
  })

  describe('add()', () => {
    it('add a member', () => {
      expect(members.count).toStrictEqual(0)

      const targetMember = new Member('id', 'name')
      const _members = members.add(targetMember)

      expect(_members.count).toStrictEqual(1)
      expect([..._members]).toStrictEqual([targetMember])
    })

    it('add multiple members', () => {
      expect(members.count).toStrictEqual(0)

      const targetMembers = new Members([
        new Member('id_1', 'name_1'),
        new Member('id_2', 'name_2'),
        new Member('id_3', 'name_3'),
      ])
      const _members = members.add(targetMembers)

      expect(_members.count).toStrictEqual(3)
      expect([..._members]).toStrictEqual([...targetMembers])
    })
  })

  describe('remove()', () => {
    const targetMember1 = new Member('id_1', 'name_1')
    const targetMember2 = new Member('id_2', 'name_2')
    const targetMember3 = new Member('id_3', 'name_3')

    beforeEach(() => {
      members = members.add(new Members([targetMember1, targetMember2, targetMember3]))
    })

    it('remove a member', () => {
      expect(members.count).toStrictEqual(3)

      const _members = members.remove(targetMember1)

      expect(_members.count).toStrictEqual(2)
      expect([..._members]).toStrictEqual([targetMember2, targetMember3])
    })

    it('remove multiple members', () => {
      expect(members.count).toStrictEqual(3)

      const _members = members.remove(new Members([targetMember1, targetMember2]))

      expect(_members.count).toStrictEqual(1)
      expect([..._members]).toStrictEqual([targetMember3])
    })
  })

  describe('pickRandomly()', () => {
    const targetMember1 = new Member('id_1', 'name_1')
    const targetMember2 = new Member('id_2', 'name_2')
    const targetMember3 = new Member('id_3', 'name_3')

    beforeEach(() => {
      members = members.add(new Members([targetMember1, targetMember2, targetMember3]))
    })

    it('randomly extract a specified number of members', () => {
      const _members = members.pickRandomly(2)

      expect(_members.count).toStrictEqual(2)
      expect([...members]).toEqual(expect.arrayContaining([..._members]))
    })
  })

  describe('pickRandomlyToFill()', () => {
    const targetMember1 = new Member('id_1', 'name_1')
    const targetMember2 = new Member('id_2', 'name_2')
    const targetMember3 = new Member('id_3', 'name_3')
    const supplyMember1 = new Member('id_4', 'name_4')
    const supplyMember2 = new Member('id_5', 'name_5')
    const supplyMember3 = new Member('id_6', 'name_6')

    let supplyMembers: Members

    beforeEach(() => {
      members = members.add(new Members([targetMember1, targetMember2, targetMember3]))
      supplyMembers = new Members([supplyMember1, supplyMember2, supplyMember3])
    })

    it('randomly pick a specified number of members from among the members that meet the specified number if they exist', () => {
      const _members = members.pickRandomlyToFill(2, supplyMembers)

      expect(_members.count).toStrictEqual(2)
      expect([...members]).toEqual(expect.arrayContaining([..._members]))
    })

    it('randomly pick a specified number of members, plus additional members, if the specified number of members do not exist', () => {
      const _members = members.pickRandomlyToFill(5, supplyMembers)

      expect(_members.count).toStrictEqual(5)
      expect([...members, ...supplyMembers]).toEqual(expect.arrayContaining([..._members]))
    })

    it('return the same members if the number of members is the same as the number specified', () => {
      const _members = members.pickRandomlyToFill(3, supplyMembers)

      expect(_members).toEqual(members)
    })
  })
})
