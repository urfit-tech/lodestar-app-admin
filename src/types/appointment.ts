import { PeriodType } from './general'

export type ReservationType = 'hour' | 'day'

export type AppointmentPlanAdminProps = {
  id: string
  title: string
  phone: string
  description: string | null
  duration: number
  listPrice: number
  schedules: AppointmentScheduleProps[]
  periods: AppointmentPeriodProps[]
  enrollments: number
  isPublished: boolean | null
  supportLocales: string[]
  currencyId: string
  creatorId: string
  isPrivate: boolean
  reservationAmount: number
  reservationType: ReservationType | null
}

export type AppointmentPeriodProps = {
  id: string
  schedule: {
    id: string
    periodAmount: number | null
    periodType: PeriodType | null
  }
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
