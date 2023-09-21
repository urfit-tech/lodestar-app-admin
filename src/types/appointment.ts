import { PeriodType } from './general'

export type ReservationType = 'hour' | 'day'
export type MeetGenerationMethod = 'auto' | 'manual'

export type AppointmentPlanAdminProps = {
  id: string
  title: string
  phone: string
  description: string | null
  duration: number
  listPrice: number
  schedules: AppointmentScheduleProps[]
  periods: AppointmentPeriodProps[]
  // enrollments: number
  isPublished: boolean | null
  supportLocales: string[]
  currencyId: string
  creatorId: string
  isPrivate: boolean
  reservationAmount: number
  reservationType: ReservationType | null
  // capacity=-1 represents no limit
  capacity: number
  // rescheduleAmount =-1 represents not reschedule
  rescheduleAmount: number
  rescheduleType: ReservationType | null
  meetGenerationMethod: MeetGenerationMethod
}

export type AppointmentPeriodProps = {
  id: string
  scheduleId: string
  startedAt: Date
  endedAt: Date
  isEnrolled?: boolean
  isExcluded?: boolean
}

export type AppointmentScheduleProps = {
  id: string
  startedAt: Date
  intervalAmount: number | null
  intervalType: PeriodType | null
  excludes: Date[]
}
