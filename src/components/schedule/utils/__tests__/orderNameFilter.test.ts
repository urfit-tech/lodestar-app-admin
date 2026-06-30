import {
  classifyOrderProduct,
  getOrderCampusIds,
  getOrderProductTitle,
  isOrderPaymentDeadlineExpiredForSchedule,
  isOrderCampusMatched,
} from '../orderNameFilter'

describe('classifyOrderProduct', () => {
  describe('product 必須是「學費」', () => {
    it('product 不是學費 → null（排除註冊費 / 教材）', () => {
      expect(
        classifyOrderProduct({
          product: '註冊費',
          classType: '團體班',
          productName: '中文_秋季團班_海內',
        }),
      ).toBeNull()
    })

    it('product 為空 → null', () => {
      expect(
        classifyOrderProduct({
          product: '',
          classType: '個人班',
          productName: '個人班_中文',
        }),
      ).toBeNull()
    })
  })

  describe('個人班嚴格依 class_type', () => {
    it('class_type === 個人班 → personal', () => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '個人班',
          productName: '中文_個人班_60堂',
        }),
      ).toBe('personal')
    })

    it('class_type 是團體班、名稱含「個人」 → 不再歸 personal', () => {
      const result = classifyOrderProduct({
        product: '學費',
        classType: '團體班',
        productName: '中文_個人混搭_60堂',
      })
      expect(result).not.toBe('personal')
    })
  })

  describe('「小組」覆蓋學期班關鍵字（規則 3 在規則 4 之前）', () => {
    it('名稱含「小組」 → group，即使有學期班關鍵字', () => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '團體班',
          productName: '中文_學期班_小組_60堂',
        }),
      ).toBe('group')
    })

    it('小組春團班（含「團班」但非「春季團班」） → group', () => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '團體班',
          productName: '(2026年)中文_標準_海內_內課_小組春團班_60-71堂',
        }),
      ).toBe('group')
    })
  })

  describe('學期班關鍵字', () => {
    it.each([
      ['冬季團班', '中文_冬季團班_海內'],
      ['春季團班', '中文_春季團班_海內'],
      ['秋季團班', '中文_秋季團班_海內'],
      ['夏季團班', '中文_夏季團班_海內'],
      ['學期班', '中文_學期班_海內'],
      ['學期團班', '中文_學期團班_海內'],
    ])('名稱含「%s」 → semester', (_label, productName) => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '團體班',
          productName,
        }),
      ).toBe('semester')
    })
  })

  describe('group 兜底', () => {
    it('TLI041089668282386 案例：小型 → group', () => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '團體班',
          productName: '(2026年)中文_標準_海內_內課_小型_60-71堂',
        }),
      ).toBe('group')
    })

    it('class_type 為空、名稱無關鍵字 → group', () => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '',
          productName: '某產品',
        }),
      ).toBe('group')
    })

    it('class_type 是團體班、名稱無學期班關鍵字 → group', () => {
      expect(
        classifyOrderProduct({
          product: '學費',
          classType: '團體班',
          productName: '中文_其他命名_60堂',
        }),
      ).toBe('group')
    })
  })

  describe('order_product metadata 解析', () => {
    it('getOrderProductTitle 可讀取教材的 options.title', () => {
      expect(
        getOrderProductTitle({
          name: '教材',
          options: {
            title: '(A5版) 商用會話',
            options: { product: '教材' },
          },
        }),
      ).toBe('(A5版) 商用會話')
    })

    it('getOrderCampusIds 可讀取 order 與 product metadata 的校區 ID', () => {
      const campusIds = getOrderCampusIds(
        { options: { campus_id: 'campus-a' } },
        {
          options: {
            permissionGroups: [{ id: 'campus-b' }],
            options: { campusId: 'campus-c' },
          },
        },
      )

      expect(campusIds).toEqual(['campus-a', 'campus-c', 'campus-b'])
    })

    it('有指定班級校區時，訂單必須解析到相同校區才可顯示', () => {
      expect(isOrderCampusMatched('campus-a', ['campus-a'])).toBe(true)
      expect(isOrderCampusMatched('campus-a', ['campus-b'])).toBe(false)
      expect(isOrderCampusMatched('campus-a', [])).toBe(false)
      expect(isOrderCampusMatched(null, [])).toBe(true)
    })
  })
})

describe('isOrderPaymentDeadlineExpiredForSchedule', () => {
  const now = new Date('2026-06-29T12:00:00+08:00')

  it('keeps SUCCESS orders schedulable after the payment deadline date', () => {
    expect(isOrderPaymentDeadlineExpiredForSchedule('SUCCESS', '2026-06-20T12:43:00+08:00', now)).toBe(false)
  })

  it('excludes unpaid orders when the payment deadline date is before today', () => {
    expect(isOrderPaymentDeadlineExpiredForSchedule('UNPAID', '2026-06-20T12:43:00+08:00', now)).toBe(true)
  })

  it('does not treat same-day payment deadline as expired by date', () => {
    expect(isOrderPaymentDeadlineExpiredForSchedule('UNPAID', '2026-06-29T08:00:00+08:00', now)).toBe(false)
  })

  it('ignores missing or invalid payment deadline values', () => {
    expect(isOrderPaymentDeadlineExpiredForSchedule('UNPAID', null, now)).toBe(false)
    expect(isOrderPaymentDeadlineExpiredForSchedule('UNPAID', 'not-a-date', now)).toBe(false)
  })
})
