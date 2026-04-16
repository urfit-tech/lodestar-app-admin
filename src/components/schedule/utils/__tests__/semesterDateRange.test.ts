import moment from 'moment'
import { computeSemesterMaxEndDate } from '../semesterDateRange'

type OrderLike = { createdAt: Date }

describe('computeSemesterMaxEndDate', () => {
  it('回傳 null 當 orders 為空', () => {
    expect(computeSemesterMaxEndDate([])).toBeNull()
  })

  it('1 張訂單 → createdAt + 180 天', () => {
    const createdAt = new Date('2026-01-10T00:00:00Z')
    const order: OrderLike = { createdAt }
    const result = computeSemesterMaxEndDate([order])
    expect(result).not.toBeNull()
    expect(result!.isSame(moment(createdAt).add(180, 'day'), 'day')).toBe(true)
  })

  it('多張訂單 → 取最早 createdAt + 180 天', () => {
    const orders: OrderLike[] = [
      { createdAt: new Date('2026-03-01T00:00:00Z') },
      { createdAt: new Date('2026-01-10T00:00:00Z') },
      { createdAt: new Date('2026-02-15T00:00:00Z') },
    ]
    const result = computeSemesterMaxEndDate(orders)
    expect(result!.isSame(moment('2026-01-10').add(180, 'day'), 'day')).toBe(true)
  })

  it('createdAt 相同 → 與任一相同基準等價', () => {
    const createdAt = new Date('2026-02-01T00:00:00Z')
    const orders: OrderLike[] = [{ createdAt }, { createdAt }]
    const result = computeSemesterMaxEndDate(orders)
    expect(result!.isSame(moment(createdAt).add(180, 'day'), 'day')).toBe(true)
  })

  it('回傳的是 Moment 物件（非 Date）', () => {
    const result = computeSemesterMaxEndDate([{ createdAt: new Date() }])
    expect(moment.isMoment(result)).toBe(true)
  })
})
