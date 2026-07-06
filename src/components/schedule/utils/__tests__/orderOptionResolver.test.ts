import { isMemberCampusMatched, resolveMemberCampusIds } from '../orderOptionResolver'

describe('orderOptionResolver member campus helpers', () => {
  const member = {
    member_permission_groups: [
      { permission_group_id: 'campus-a', permission_group: { id: 'campus-a', name: 'A Campus' } },
      { permission_group: { id: 'campus-b', name: 'B Campus' } },
    ],
  }

  it('resolves unique campus ids from member permission groups', () => {
    expect(resolveMemberCampusIds(member)).toEqual(['campus-a', 'campus-b'])
  })

  it('matches target campus by member permission groups', () => {
    expect(isMemberCampusMatched('campus-a', member)).toBe(true)
    expect(isMemberCampusMatched('campus-c', member)).toBe(false)
    expect(isMemberCampusMatched(null, member)).toBe(true)
  })
})
