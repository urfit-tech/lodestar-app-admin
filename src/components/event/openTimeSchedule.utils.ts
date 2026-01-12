import { RRule, rrulestr, Weekday } from 'rrule'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import {
  createEmptyWeeklySchedule,
  RepeatConfig,
  TimeSlot,
  WeeklySchedule,
  DaySchedule,
  TIME_OPTIONS,
  DAY_LABELS,
} from './openTimeSchedule.type'
import { GeneralEventApi } from './events.type'

// 將星期幾轉換為 RRule Weekday
export const dayOfWeekToRRuleWeekday = (dayOfWeek: number): Weekday => {
  // dayOfWeek: 1=週一, ..., 7=週日
  // RRule: MO=0, TU=1, WE=2, TH=3, FR=4, SA=5, SU=6
  const weekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU]
  return weekdays[dayOfWeek - 1]
}

// 將 Date 轉換為星期幾 (1-7)
export const dateToDayOfWeek = (date: Date): number => {
  const day = moment(date).isoWeekday() // 1=週一, 7=週日
  return day
}

// 將 Date 轉換為 'HH:mm' 格式
export const dateToTimeString = (date: Date): string => {
  return moment(date).format('HH:mm')
}

// 將 'HH:mm' 字串轉換為分鐘數（用於比較）
export const timeStringToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 比較兩個時間字串
export const compareTimeStrings = (a: string, b: string): number => {
  return timeStringToMinutes(a) - timeStringToMinutes(b)
}

// 檢查時間段是否重疊
export const isTimeSlotOverlapping = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = timeStringToMinutes(slot1.startTime)
  const end1 = timeStringToMinutes(slot1.endTime)
  const start2 = timeStringToMinutes(slot2.startTime)
  const end2 = timeStringToMinutes(slot2.endTime)

  return start1 < end2 && start2 < end1
}

// 檢查新時段是否與現有時段衝突
export const hasTimeConflict = (newSlot: TimeSlot, existingSlots: TimeSlot[]): boolean => {
  return existingSlots.some(slot => slot.id !== newSlot.id && isTimeSlotOverlapping(newSlot, slot))
}

// 獲取可用的起始時間選項（排除已被佔用的時段）
export const getAvailableStartTimeOptions = (existingSlots: TimeSlot[], currentSlotId?: string): string[] => {
  const occupiedRanges = existingSlots
    .filter(slot => slot.id !== currentSlotId)
    .map(slot => ({
      start: timeStringToMinutes(slot.startTime),
      end: timeStringToMinutes(slot.endTime),
    }))

  return TIME_OPTIONS.filter(time => {
    const minutes = timeStringToMinutes(time)
    return !occupiedRanges.some(range => minutes >= range.start && minutes < range.end)
  })
}

// 獲取可用的結束時間選項（必須晚於起始時間，且不與其他時段衝突）
export const getAvailableEndTimeOptions = (
  startTime: string,
  existingSlots: TimeSlot[],
  currentSlotId?: string
): string[] => {
  const startMinutes = timeStringToMinutes(startTime)

  // 找到下一個被佔用時段的起始時間
  const nextOccupiedStart = existingSlots
    .filter(slot => slot.id !== currentSlotId)
    .map(slot => timeStringToMinutes(slot.startTime))
    .filter(start => start > startMinutes)
    .sort((a, b) => a - b)[0]

  return TIME_OPTIONS.filter(time => {
    const minutes = timeStringToMinutes(time)
    // 必須晚於起始時間
    if (minutes <= startMinutes) return false
    // 如果有下一個被佔用時段，結束時間不能超過它
    if (nextOccupiedStart !== undefined && minutes > nextOccupiedStart) return false
    return true
  })
}

// 創建新的時段（預設為上一個時段結束後一小時）
export const createNewTimeSlot = (existingSlots: TimeSlot[]): TimeSlot | null => {
  const sortedSlots = [...existingSlots].sort((a, b) => compareTimeStrings(a.endTime, b.endTime))
  const lastSlot = sortedSlots[sortedSlots.length - 1]

  let startTime: string
  if (lastSlot) {
    // 從上一個時段結束時間開始
    const lastEndMinutes = timeStringToMinutes(lastSlot.endTime)
    const newStartMinutes = lastEndMinutes
    if (newStartMinutes >= 24 * 60) return null // 超過 24 小時

    startTime = TIME_OPTIONS.find(t => timeStringToMinutes(t) >= newStartMinutes) || '23:30'
  } else {
    startTime = '09:00' // 預設起始時間
  }

  // 結束時間為起始時間後一小時
  const startMinutes = timeStringToMinutes(startTime)
  const endMinutes = startMinutes + 60
  if (endMinutes > 24 * 60) return null

  const endTime = TIME_OPTIONS.find(t => timeStringToMinutes(t) >= endMinutes) || '23:30'

  return {
    id: uuidv4(),
    startTime,
    endTime,
  }
}

// 複製一天的時段到所有天
export const copyDayScheduleToAll = (sourceDayIndex: number, schedule: WeeklySchedule): WeeklySchedule => {
  const sourceDay = schedule[sourceDayIndex]
  return schedule.map((day, index) => {
    if (index === sourceDayIndex) return day
    return {
      ...day,
      slots: sourceDay.slots.map(slot => ({
        ...slot,
        id: uuidv4(), // 為每個複製的時段生成新 ID
      })),
    }
  })
}

// 將週期時間表轉換為事件列表（用於創建 API）
export const weeklyScheduleToEvents = (
  schedule: WeeklySchedule,
  repeatConfig: { isWeeklyRepeat: boolean; repeatUntil: Date | null },
  baseDate: Date = new Date()
): GeneralEventApi[] => {
  const events: GeneralEventApi[] = []

  schedule.forEach(daySchedule => {
    daySchedule.slots.forEach(slot => {
      // 找到下一個該星期幾的日期
      const targetDate = getNextWeekday(baseDate, daySchedule.dayOfWeek)

      const startDate = moment(targetDate)
        .set({
          hour: parseInt(slot.startTime.split(':')[0]),
          minute: parseInt(slot.startTime.split(':')[1]),
          second: 0,
        })
        .toDate()

      const endDate = moment(targetDate)
        .set({
          hour: parseInt(slot.endTime.split(':')[0]),
          minute: parseInt(slot.endTime.split(':')[1]),
          second: 0,
        })
        .toDate()

      const event: GeneralEventApi = {
        start: startDate,
        end: endDate,
        title: '開放時間',
        extendedProps: {
          role: 'available',
        },
      }

      // 如果是每週重複，添加 RRule
      if (repeatConfig.isWeeklyRepeat) {
        const rruleOptions: any = {
          freq: RRule.WEEKLY,
          byweekday: [dayOfWeekToRRuleWeekday(daySchedule.dayOfWeek)],
          dtstart: startDate,
        }

        if (repeatConfig.repeatUntil) {
          rruleOptions.until = repeatConfig.repeatUntil
        }

        const rrule = new RRule(rruleOptions)
        ;(event as any).rrule = rrule.toString()
        ;(event as any).duration = moment(endDate).diff(moment(startDate), 'milliseconds')
        if (repeatConfig.repeatUntil) {
          ;(event as any).until = repeatConfig.repeatUntil
        }
      }

      events.push(event)
    })
  })

  return events
}

// 獲取下一個指定星期幾的日期
export const getNextWeekday = (fromDate: Date, dayOfWeek: number): Date => {
  const currentDay = moment(fromDate).isoWeekday()
  let daysToAdd = dayOfWeek - currentDay
  if (daysToAdd < 0) daysToAdd += 7

  return moment(fromDate).add(daysToAdd, 'days').toDate()
}

// 從事件中提取星期幾和時間範圍的顯示文字
export const getEventDisplayInfo = (event: GeneralEventApi): { dayLabel: string; timeRange: string } => {
  const dayOfWeek = dateToDayOfWeek(event.start)
  const dayLabel = DAY_LABELS[dayOfWeek - 1] || ''
  const startTime = dateToTimeString(event.start)
  const endTime = dateToTimeString(event.end)
  const timeRange = `${startTime} - ${endTime}`

  return { dayLabel, timeRange }
}

// 過濾出只有未來的事件（有 rrule 的事件不過濾，因為會由日曆插件處理）
export const filterFutureEvents = (events: GeneralEventApi[]): GeneralEventApi[] => {
  const now = moment()
  return events.filter(event => {
    // 如果有 rrule，不過濾（日曆插件會處理重複事件的顯示）
    if ((event as any).rrule) return true
    // 將 start 轉換為 moment 物件進行比較（支援字串和 Date 格式）
    const eventStart = moment(event.start)
    return eventStart.isSameOrAfter(now)
  })
}

// 將事件按照星期幾分組
export const groupEventsByDayOfWeek = (events: GeneralEventApi[]): Map<number, GeneralEventApi[]> => {
  const grouped = new Map<number, GeneralEventApi[]>()

  events.forEach(event => {
    const dayOfWeek = dateToDayOfWeek(event.start)
    if (!grouped.has(dayOfWeek)) {
      grouped.set(dayOfWeek, [])
    }
    grouped.get(dayOfWeek)!.push(event)
  })

  return grouped
}

// 將事件列表轉換為 WeeklySchedule（用於編輯模式）
export const eventsToWeeklySchedule = (
  events: GeneralEventApi[]
): { schedule: WeeklySchedule; repeatConfig: RepeatConfig } => {
  const schedule = createEmptyWeeklySchedule()
  let repeatConfig: RepeatConfig = {
    isWeeklyRepeat: false,
    repeatUntil: null,
  }

  events.forEach(event => {
    // 檢查是否為重複事件
    if ((event as any).rrule) {
      repeatConfig.isWeeklyRepeat = true

      try {
        const rrule = rrulestr((event as any).rrule)
        if (rrule.origOptions.until) {
          const untilDate = rrule.origOptions.until as Date
          // 判斷是否為預設的「永久重複」值（超過 50 年視為永久重複）
          const isDefaultInfiniteRepeat = moment(untilDate).isAfter(moment().add(50, 'years'))
          if (!isDefaultInfiniteRepeat) {
            // 取最遠的結束日期
            if (!repeatConfig.repeatUntil || moment(untilDate).isAfter(repeatConfig.repeatUntil)) {
              repeatConfig.repeatUntil = untilDate
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse rrule:', e)
      }
    }

    // 取得該事件對應的星期幾
    const dayOfWeek = dateToDayOfWeek(event.start)
    const dayIndex = dayOfWeek - 1 // 轉為 0-indexed

    // 新增時段
    const slot: TimeSlot = {
      id: uuidv4(),
      startTime: dateToTimeString(event.start),
      endTime: dateToTimeString(event.end),
    }

    schedule[dayIndex].slots.push(slot)
  })

  // 排序每天的時段
  schedule.forEach(day => {
    day.slots.sort((a, b) => compareTimeStrings(a.startTime, b.startTime))
  })

  return { schedule, repeatConfig }
}
