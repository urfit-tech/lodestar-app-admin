import { ScheduleType } from '../../../types/schedule'

const PERSONAL_KEYWORD = '個人'

const normalize = (value?: string | null): string => (value || '').trim()

const includesKeyword = (value?: string | null, keyword?: string | null): boolean => {
  const normalizedValue = normalize(value)
  const normalizedKeyword = normalize(keyword)

  if (!normalizedKeyword) return true
  if (!normalizedValue) return false

  return normalizedValue.includes(normalizedKeyword)
}

export const matchesPersonalProductName = (productName?: string | null): boolean => {
  return includesKeyword(productName, PERSONAL_KEYWORD)
}

export const matchesLanguageProductName = (productName?: string | null, language?: string | null): boolean => {
  return includesKeyword(productName, language)
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
 * 規則：
 * 1. product !== '學費' → null（排除註冊費、教材等）
 * 2. class_type === '個人班' 或名稱含「個人」→ personal
 * 3. class_type === '團體班' 或名稱含任一學期班關鍵字 → semester
 * 4. 其餘學費訂單 → group（小組班）
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

  // 個人班
  if (classType === '個人班' || includesKeyword(productName, '個人')) {
    return 'personal'
  }

  // 學期班
  if (classType === '團體班' || SEMESTER_KEYWORDS.some(kw => includesKeyword(productName, kw))) {
    return 'semester'
  }

  // 小組班（兜底）
  return 'group'
}

export const matchesScheduleOrderProductName = ({
  productName,
  scheduleType,
  language,
}: {
  productName?: string | null
  scheduleType: ScheduleType | 'semester' | 'group'
  language?: string | null
}): boolean => {
  if (scheduleType === 'personal' && !matchesPersonalProductName(productName)) {
    return false
  }

  if (!matchesLanguageProductName(productName, language)) {
    return false
  }

  return true
}

