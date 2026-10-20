import { RRule } from 'rrule'
import { toOpenTimeCalendarEvent } from './openTimeSchedule.utils'

const start = new Date('2026-10-20T01:00:00Z')
const end = new Date('2026-10-20T02:00:00Z')

it('preserves a one-off event and its metadata', () => {
  const event = { id: 'slot', start, end, extendedProps: { teacher: 'member-1' } }
  expect(toOpenTimeCalendarEvent(event)).toMatchObject(event)
  expect(toOpenTimeCalendarEvent(event).rrule).toBeUndefined()
})

it.each([false, true])('converts recurrence and exclusion rules (serialized=%s)', serialized => {
  const rule = new RRule({ freq: RRule.WEEKLY, dtstart: start, count: 5 })
  const excluded = new RRule({ freq: RRule.WEEKLY, dtstart: start, count: 1 })
  const result = toOpenTimeCalendarEvent({
    start,
    end,
    duration: 3600000,
    rrule: serialized ? rule.toString() : rule,
    exrule: serialized ? excluded.toString() : excluded,
    exdate: [start],
  })
  expect(result.rrule).toBe(rule.toString())
  expect(result.exrule).toMatchObject({ freq: RRule.WEEKLY, count: 1, dtstart: start })
  expect(result.duration).toBe(3600000)
  expect(result.exdate).toEqual([start])
})
