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
  test.each(['123', '電話 +12025550173', '+12025550173 ext 123', '+800123', '+870000000000'])(
    'rejects incomplete or unsupported input %s',
    value => {
      expect(() => normalizeMemberPhone(value, 'TW')).toThrow('請輸入有效電話')
    },
  )
})

test.each(['+80012345678', '+870773111632', '+881612345678'])(
  'preserves non-geographic E.164 %s without inventing an ISO country',
  value => {
    expect(normalizeMemberPhone(value, 'TW')).toEqual({
      phone: value,
      country_code: null,
      international_phone: value,
    })
  },
)
