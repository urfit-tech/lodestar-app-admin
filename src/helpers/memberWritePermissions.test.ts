import { describe, expect, jest, test } from '@jest/globals'
import {
  assertMemberUpdated,
  canEditMemberIdentity,
  canWriteMemberPhone,
  checkMemberMutation,
  checkMemberNoteMutation,
} from './memberWritePermissions'

const member = {
  id: 'target',
  role: 'general-member',
  permissionIds: [],
  permissionGroups: [],
}

describe('post-incident member write permissions', () => {
  test('MEMBER_CREATE alone cannot insert another member phone', () => {
    expect(canWriteMemberPhone('general-member', { MEMBER_CREATE: true }, 'staff', 'target')).toBe(false)
  })
  test.each([
    'MEMBER_ADMIN',
    'MEMBER_PHONE_ADMIN',
    'SALES_LEAD_ADMIN',
    'SALES_LEAD_NORMAL',
    'SALES_LEAD_SELECTOR_ADMIN',
    'SALES_LEAD_SAME_DIVISION_SELECTOR',
    'SALES_LEAD_SAME_PERMISSION_GROUP_SELECTOR',
    'SALES_LEAD_DELIVERY_ADMIN',
    'SALES_CALL_ADMIN',
  ])('%s permits phone writes', permission => {
    expect(canWriteMemberPhone('general-member', { [permission]: true }, 'staff', 'target')).toBe(true)
  })
  test('phone self and owner exceptions do not grant anonymous access', () => {
    expect(canWriteMemberPhone('general-member', {}, 'self', 'self')).toBe(true)
    expect(canWriteMemberPhone('content-creator', {}, 'self', 'self')).toBe(true)
    expect(canWriteMemberPhone('app-owner', {})).toBe(true)
    expect(canWriteMemberPhone('anonymous', { MEMBER_ADMIN: true })).toBe(false)
  })
  test('allow potentially legal staff edits while the trigger checks hidden extras', () => {
    expect(canEditMemberIdentity('general-member', 'staff', member)).toBe(true)
    expect(canEditMemberIdentity('general-member', 'staff', { ...member, permissionIds: ['BACKSTAGE_ENTER'] })).toBe(
      false,
    )
    expect(
      canEditMemberIdentity('general-member', 'staff', {
        ...member,
        permissionGroups: [{ id: 'group', name: 'staff' }],
      }),
    ).toBe(false)
    expect(canEditMemberIdentity('general-member', 'staff', { ...member, role: 'content-creator' })).toBe(false)
  })
  test('identity self and owner exceptions match the trigger', () => {
    const staff = { ...member, role: 'content-creator', permissionIds: ['BACKSTAGE_ENTER'] }
    expect(canEditMemberIdentity('general-member', 'target', staff)).toBe(true)
    expect(canEditMemberIdentity('app-owner', 'owner', staff)).toBe(true)
  })
  test.each([undefined, null, { update_member: null }, { update_member: { affected_rows: 0 } }])(
    'empty update result rejects: %p',
    data => {
      expect(() => assertMemberUpdated({ data })).toThrow('會員資料未更新')
    },
  )
  test('successful mutations retain their result; zero rows reject before success handlers', async () => {
    const result = { data: { update_member: { affected_rows: 1 } } }
    await expect(checkMemberMutation(async () => result)()).resolves.toBe(result)
    await expect(
      checkMemberMutation(async () => ({ data: { update_member: { affected_rows: 0 } } }))(),
    ).rejects.toThrow('會員資料未更新')
  })
})

describe('member note compound mutation results', () => {
  test('complete success retains the note result without warning', async () => {
    const result = { data: { insert_member_note_one: { id: 'note' }, update_member: { affected_rows: 1 } } }
    const warn = jest.fn()
    await expect(checkMemberNoteMutation(async () => result, warn)()).resolves.toBe(result)
    expect(warn).not.toHaveBeenCalled()
  })
  test.each([undefined, null])('missing note id rejects even if the timestamp update succeeded: %p', async note => {
    const warn = jest.fn()
    await expect(
      checkMemberNoteMutation(
        async () => ({
          data: {
            insert_member_note_one: note,
            update_member: { affected_rows: 1 },
          },
        }),
        warn,
      )(),
    ).rejects.toThrow('會員紀錄未建立')
    expect(warn).not.toHaveBeenCalled()
  })
})
