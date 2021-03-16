export type ScheduleIntervalType = 'Y' | 'M' | 'W' | 'D'
export type ReservationType = 'hour' | 'day'
export type AppointmentPlanAdminProps = {
  id: string
  title: string
  phone: string
  description: string | null
  duration: number
  listPrice: number
  schedules: {
    id: string
    excludes: number[]
  }[]
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
    periodType: ScheduleIntervalType | null
  }
  startedAt: Date
  endedAt: Date
  isEnrolled?: boolean
  isExcluded?: boolean
}
