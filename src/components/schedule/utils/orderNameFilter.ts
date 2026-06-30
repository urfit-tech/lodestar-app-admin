const normalize = (value?: string | null): string => (value || '').trim()

const includesKeyword = (value?: string | null, keyword?: string | null): boolean => {
  const normalizedValue = normalize(value)
  const normalizedKeyword = normalize(keyword)

  if (!normalizedKeyword) return true
  if (!normalizedValue) return false

  return normalizedValue.includes(normalizedKeyword)
}

/**
 * 排課系統訂單狀態過濾規則：
 * - UNPAID（待付款）：要抓（不管有無交付）
 * - SUCCESS（已完成）：要抓
 * - EXPIRED（已失效）：不抓
 * - REFUND / PARTIAL_REFUND（已退款/部分退款）：不抓
 */
const EXCLUDED_ORDER_STATUSES = ['EXPIRED', 'REFUND', 'PARTIAL_REFUND']

export const isOrderStatusValidForSchedule = (status?: string | null): boolean => {
  if (!status) return false
  return !EXCLUDED_ORDER_STATUSES.some(excluded => status.includes(excluded))
}

const SUCCESS_ORDER_STATUS = 'SUCCESS'

const toValidDate = (value?: Date | string | null): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const isOrderPaymentDeadlineExpiredForSchedule = (
  status?: string | null,
  paymentExpiredAt?: Date | string | null,
  now: Date = new Date(),
): boolean => {
  if (normalize(status) === SUCCESS_ORDER_STATUS) return false

  const expiredAt = toValidDate(paymentExpiredAt)
  if (!expiredAt) return false

  return startOfDay(expiredAt).getTime() < startOfDay(now).getTime()
}

export const SEMESTER_KEYWORDS = ['冬季團班', '春季團班', '秋季團班', '夏季團班', '學期班', '學期團班']

export type ClassCategory = 'personal' | 'semester' | 'group'

type OrderProductLike = {
  name?: string | null
  options?: Record<string, any> | null
}

type OrderLogLike = {
  options?: Record<string, any> | null
}

export const getOrderProductRawOptions = (product?: OrderProductLike | null): Record<string, any> => {
  return ((product?.options || {}) as Record<string, any>) || {}
}

export const getOrderProductOptionMeta = (product?: OrderProductLike | null): Record<string, any> => {
  const rawOptions = getOrderProductRawOptions(product)
  return ((rawOptions.options || {}) as Record<string, any>) || {}
}

export const getOrderProductTitle = (product?: OrderProductLike | null): string => {
  const rawOptions = getOrderProductRawOptions(product)
  const optionMeta = getOrderProductOptionMeta(product)
  return normalize(optionMeta.title) || normalize(rawOptions.title) || normalize(product?.name)
}

const normalizeIdValues = (value: any): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) {
    return value.flatMap(normalizeIdValues)
  }
  if (typeof value === 'object') {
    return normalizeIdValues(
      value.id ||
        value.value ||
        value.campus_id ||
        value.campusId ||
        value.permission_group_id ||
        value.permissionGroupId,
    )
  }

  const normalized = normalize(String(value))
  return normalized ? [normalized] : []
}

const unique = (values: string[]): string[] => {
  return values.filter((value, index, self) => self.indexOf(value) === index)
}

export const getOrderCampusIds = (
  order?: OrderLogLike | null,
  product?: OrderProductLike | null,
): string[] => {
  const orderOptions = ((order?.options || {}) as Record<string, any>) || {}
  const rawOptions = getOrderProductRawOptions(product)
  const optionMeta = getOrderProductOptionMeta(product)

  return unique(
    [
      orderOptions.campus_id,
      orderOptions.campusId,
      orderOptions.campus_ids,
      orderOptions.campusIds,
      orderOptions.permission_group_id,
      orderOptions.permissionGroupId,
      orderOptions.permission_group_ids,
      orderOptions.permissionGroupIds,
      orderOptions.permission_groups,
      orderOptions.permissionGroups,
      optionMeta.campus_id,
      optionMeta.campusId,
      optionMeta.campus_ids,
      optionMeta.campusIds,
      optionMeta.permission_group_id,
      optionMeta.permissionGroupId,
      optionMeta.permission_group_ids,
      optionMeta.permissionGroupIds,
      optionMeta.permission_groups,
      optionMeta.permissionGroups,
      rawOptions.campus_id,
      rawOptions.campusId,
      rawOptions.campus_ids,
      rawOptions.campusIds,
      rawOptions.permission_group_id,
      rawOptions.permissionGroupId,
      rawOptions.permission_group_ids,
      rawOptions.permissionGroupIds,
      rawOptions.permission_groups,
      rawOptions.permissionGroups,
    ].flatMap(normalizeIdValues),
  )
}

export const isOrderCampusMatched = (targetCampusId?: string | null, orderCampusIds: string[] = []): boolean => {
  if (!targetCampusId) return true
  return orderCampusIds.includes(targetCampusId)
}

/**
 * 統一分類訂單產品屬於哪種班別。
 *
 * 規則（依序判斷，先匹配者勝出）：
 * 1. product !== '學費' → null（排除註冊費、教材等）
 * 2. class_type === '個人班' → personal
 * 3. 名稱含「小組」 → group（覆蓋優先，吃下「小組春團班」等混搭命名）
 * 4. 名稱含任一學期班關鍵字 → semester
 * 5. 其餘 → group（兜底）
 *
 * 註：小組班與學期班的 class_type 都是「團體班」，所以無法只靠 class_type
 * 區分，需要靠名稱關鍵字。「小組」前綴比學期班季節關鍵字更具決定性，
 * 因此規則 3 必須在規則 4 之前。
 */
export const classifyOrderProduct = (options: {
  product?: string | null
  classType?: string | null
  productName?: string | null
}): ClassCategory | null => {
  const product = normalize(options.product)
  if (product !== '學費') return null

  const classType = normalize(options.classType)
  const productName = normalize(options.productName)

  if (classType === '個人班') {
    return 'personal'
  }

  if (includesKeyword(productName, '小組')) {
    return 'group'
  }

  if (SEMESTER_KEYWORDS.some(kw => includesKeyword(productName, kw))) {
    return 'semester'
  }

  return 'group'
}
