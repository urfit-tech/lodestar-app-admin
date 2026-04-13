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

export const SEMESTER_KEYWORDS = ['冬季團班', '春季團班', '秋季團班', '夏季團班', '學期班', '學期團班']

export type ClassCategory = 'personal' | 'semester' | 'group'

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
