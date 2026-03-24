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

