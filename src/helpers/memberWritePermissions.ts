// Mirrors Hasura origin/master: public_member_phone insert permissions.
const phonePermissions = [
  'MEMBER_ADMIN',
  'MEMBER_PHONE_ADMIN',
  'SALES_LEAD_ADMIN',
  'SALES_LEAD_NORMAL',
  'SALES_LEAD_SELECTOR_ADMIN',
  'SALES_LEAD_SAME_DIVISION_SELECTOR',
  'SALES_LEAD_SAME_PERMISSION_GROUP_SELECTOR',
  'SALES_LEAD_DELIVERY_ADMIN',
  'SALES_CALL_ADMIN',
]

export const canWriteMemberPhone = (
  role: string | null,
  permissions: Record<string, boolean | undefined>,
  currentMemberId?: string | null,
  memberId?: string,
) =>
  role === 'app-owner' ||
  ((role === 'general-member' || role === 'content-creator') &&
    ((!!currentMemberId && currentMemberId === memberId) || phonePermissions.some(key => permissions[key])))

export const ownerReadOnlyMessage = '此會員為 app-owner，只有 app-owner 可以編輯其資料。'
export const identityReadOnlyMessage =
  '此對象為講師／後台人員，或目前無權確認其額外權限；帳號與信箱請由本人或 app-owner 修改。'
export const memberUpdateFailure = '會員資料未更新：目前沒有此會員的編輯權限，或資料已不存在。請重新整理並確認權限。'

export const canEditMemberIdentity = (
  role: string | null,
  currentMemberId: string | null,
  target: {
    id: string
    role: string
    permissionIds: string[]
    identityPermissionsVisible?: boolean
    permissionGroups?: { id: string; name: string }[]
  },
) =>
  role === 'app-owner' ||
  currentMemberId === target.id ||
  (role === 'general-member' &&
    target.role === 'general-member' &&
    target.identityPermissionsVisible === true &&
    target.permissionIds.length === 0 &&
    target.permissionGroups?.length === 0)

export const assertMemberUpdated = (result: { data?: { update_member?: { affected_rows: number } | null } | null }) => {
  if (!result.data?.update_member?.affected_rows) throw new Error(memberUpdateFailure)
}

export const checkMemberMutation =
  <A extends unknown[], R extends { data?: { update_member?: { affected_rows: number } | null } | null }>(
    mutate: (...args: A) => Promise<R>,
    failureMessage = memberUpdateFailure,
  ) =>
  async (...args: A): Promise<R> => {
    const result = await mutate(...args)
    if (!result.data?.update_member?.affected_rows) throw new Error(failureMessage)
    return result
  }
