import {
  matchesLanguageProductName,
  matchesPersonalProductName,
  matchesScheduleOrderProductName,
} from './orderNameFilter'

describe('orderNameFilter', () => {
  it('matches personal product name when title includes 個人', () => {
    expect(matchesPersonalProductName('英文個人班課程')).toBe(true)
    expect(matchesPersonalProductName('英文團體班課程')).toBe(false)
  })

  it('matches language product name when title includes selected language', () => {
    expect(matchesLanguageProductName('中文團體班', '中文')).toBe(true)
    expect(matchesLanguageProductName('英文團體班', '中文')).toBe(false)
  })

  it('returns true for language match when no language is provided', () => {
    expect(matchesLanguageProductName('任意課程', '')).toBe(true)
    expect(matchesLanguageProductName('任意課程', undefined)).toBe(true)
  })

  it('applies both personal and language rules by schedule type', () => {
    expect(
      matchesScheduleOrderProductName({
        productName: '中文個人班',
        scheduleType: 'personal',
        language: '中文',
      }),
    ).toBe(true)

    expect(
      matchesScheduleOrderProductName({
        productName: '中文團體班',
        scheduleType: 'personal',
        language: '中文',
      }),
    ).toBe(false)

    expect(
      matchesScheduleOrderProductName({
        productName: '英文團體班',
        scheduleType: 'group',
        language: '中文',
      }),
    ).toBe(false)
  })
})

