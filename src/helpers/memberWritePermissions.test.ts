import { describe, expect, test } from '@jest/globals'
import {
  assertMemberUpdated,
  canEditMemberIdentity,
  canWriteMemberPhone,
  checkMemberMutation,
} from './memberWritePermissions'

const member = {
  id: 'target',
  role: 'general-member',
  permissionIds: [],
  permissionGroups: [],
  identityPermissionsVisible: true,
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
  test('staff identity edits require a positively verified plain member', () => {
    expect(canEditMemberIdentity('general-member', 'staff', member)).toBe(true)
    expect(canEditMemberIdentity('general-member', 'staff', { ...member, identityPermissionsVisible: false })).toBe(
      false,
    )
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
