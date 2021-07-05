import { Member, Members } from '..'

describe('Members', () => {
  let members: Members

  beforeEach(() => {
    members = new Members()
  })

  describe('add()', () => {
    it('メンバーを追加できること', () => {
      expect(members.count).toStrictEqual(0)

      const targetMember = new Member('id', 'name')
      const _members = members.add(targetMember)

      expect(_members.count).toStrictEqual(1)
      expect([..._members]).toStrictEqual([targetMember])
    })

    it('メンバーを複数同時に追加できること', () => {
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

    it('メンバーを削除できること', () => {
      expect(members.count).toStrictEqual(3)

      const _members = members.remove(targetMember1)

      expect(_members.count).toStrictEqual(2)
      expect([..._members]).toStrictEqual([targetMember2, targetMember3])
    })

    it('メンバーを複数同時に削除できること', () => {
      expect(members.count).toStrictEqual(3)

      const _members = members.remove(new Members([targetMember1, targetMember2]))

      expect(_members.count).toStrictEqual(1)
      expect([..._members]).toStrictEqual([targetMember3])
    })
  })

  describe('pickRandomized()', () => {
    const targetMember1 = new Member('id_1', 'name_1')
    const targetMember2 = new Member('id_2', 'name_2')
    const targetMember3 = new Member('id_3', 'name_3')

    beforeEach(() => {
      members = members.add(new Members([targetMember1, targetMember2, targetMember3]))
    })

    it('指定数のメンバーをランダムに抽出できること', () => {
      const _members = members.pickRandomized(2)

      expect(_members.count).toStrictEqual(2)
      expect([...members]).toEqual(expect.arrayContaining([..._members]))
    })
  })
})
