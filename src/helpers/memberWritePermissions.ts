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
  '此對象為講師或具有額外權限／權限群組的人員；帳號與信箱請由本人或 app-owner 修改。'
export const memberUpdateFailure = '會員資料未更新：目前沒有此會員的編輯權限，或資料已不存在。請重新整理並確認權限。'

// Extra permissions can be hidden by Hasura's select filter. Empty results do not certify
// a plain member: allow eligible edits and let member_identity_update_guard decide at write time.
// Known roles, extras and groups remain read-only; callers must also check the field's EDIT permission.
export const canEditMemberIdentity = (
  role: string | null,
  currentMemberId: string | null,
  target: {
    id: string
    role: string
    permissionIds: string[]
    permissionGroups?: { id: string; name: string }[]
  },
) =>
  role === 'app-owner' ||
  currentMemberId === target.id ||
  (role === 'general-member' &&
    target.role === 'general-member' &&
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

export const memberNotePartialSuccessMessage =
  '紀錄已建立，但會員的最後紀錄時間未更新，請確認會員編輯權限；不需重複新增紀錄。'

// Inserting a note and updating its member timestamp are independent permission outcomes.
// Preserve the committed note id so callers can save attachments and finish their UI flow.
export const checkMemberNoteMutation =
  <
    A extends unknown[],
    R extends {
      data?: {
        insert_member_note_one?: { id: string } | null
        update_member?: { affected_rows: number } | null
      } | null
    },
  >(
    mutate: (...args: A) => Promise<R>,
    onPartialSuccess: () => void,
  ) =>
  async (...args: A): Promise<R> => {
    const result = await mutate(...args)
    if (!result.data?.insert_member_note_one?.id) throw new Error('會員紀錄未建立，請確認權限後重試。')
    if (!result.data.update_member?.affected_rows) onPartialSuccess()
    return result
  }
