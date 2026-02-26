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

