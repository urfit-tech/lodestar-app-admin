import { describe, expect, test } from '@jest/globals'
import { normalizeMemberPhone } from './memberPhone'

describe('member phone country normalization', () => {
  test('uses the selected country for national numbers', () => {
    expect(normalizeMemberPhone('020 7946 0018', 'GB')).toEqual({
      phone: '02079460018',
      country_code: 'GB',
      international_phone: '+442079460018',
    })
  })
  test('international prefix overrides the default country', () => {
    expect(normalizeMemberPhone('+1 202 555 0173', 'TW')).toEqual({
      phone: '2025550173',
      country_code: 'US',
      international_phone: '+12025550173',
    })
  })
  test.each(['123', '電話 +12025550173', '+12025550173 ext 123'])(
    'rejects incomplete or unsupported input %s',
    value => {
      expect(() => normalizeMemberPhone(value, 'TW')).toThrow('請輸入有效電話')
    },
  )
})
