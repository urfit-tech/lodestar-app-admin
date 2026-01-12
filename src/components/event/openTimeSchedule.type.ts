import { GeneralEventApi } from './events.type'

// 時間格式定義
export type TimeSlot = {
  id: string
  startTime: string // 'HH:mm' 格式，如 '09:00', '09:30'
  endTime: string // 'HH:mm' 格式
}

// 每日時段設定
export type DaySchedule = {
  dayOfWeek: number // 1=週一, 2=週二, ..., 7=週日 (ISO 週日格式)
  dayLabel: string // '週一', '週二', ...
  slots: TimeSlot[]
}

// 週期時間表
export type WeeklySchedule = DaySchedule[]

// 重複設定
export type RepeatConfig = {
  isWeeklyRepeat: boolean
  repeatUntil: Date | null // null 表示永久重複
}

// 刪除類型
export type DeleteType = 'thisWeek' | 'untilDate' | 'all'

// 刪除 Modal 資訊
export type DeleteModalInfo = {
  event: GeneralEventApi
  dayLabel: string
  timeRange: string // '18:30 - 19:00'
}

// 時間選項生成（半小時為單位）
export const TIME_OPTIONS: string[] = [
  '00:00',
  '00:30',
  '01:00',
  '01:30',
  '02:00',
  '02:30',
  '03:00',
  '03:30',
  '04:00',
  '04:30',
  '05:00',
  '05:30',
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30',
]

// 星期標籤
export const DAY_LABELS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']

// 初始化空的週期時間表
export const createEmptyWeeklySchedule = (): WeeklySchedule =>
  DAY_LABELS.map((label, index) => ({
    dayOfWeek: index + 1, // 1-7
    dayLabel: label,
    slots: [],
  }))

// 生成唯一 ID
export const generateSlotId = (): string => `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
