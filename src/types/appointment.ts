import { PeriodType } from './general'

export type ReservationType = 'hour' | 'day'
export type MeetGenerationMethod = 'auto' | 'manual'
export type RescheduleType = 'hour' | 'day'

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
  onClick?: () => void
  targetMemberBooked?: boolean
  isBookedReachLimit?: boolean
}

export type AppointmentScheduleProps = {
  id: string
  startedAt: Date
  intervalAmount: number | null
  intervalType: PeriodType | null
  excludes: Date[]
}

export type AppointmentPlanProps = {
  id: string
  creator: {
    id: string
    avatarUrl: string | null
    name: string
    abstract: string | null
  }
  title: string
  duration: number
  listPrice: number
  currencyId: string
  enrollments: number
  isPublished: boolean
}

export type AppointmentPeriodPlanProps = {
  id: string
  creator?: {
    id: string | null
    avatarUrl: string | null
    name: string | null
  }
  title: string
  duration: number
  rescheduleAmount: number
  rescheduleType: RescheduleType
}

export type AppointmentPeriodCardProps = {
  id: string
  member: {
    id: string
    name: string
    email: string | null
    phone: string | null
    avatarUrl: string | null
  }
  appointmentPlan: AppointmentPeriodPlanProps
  startedAt: Date
  endedAt: Date
  canceledAt: Date | null
  creator: {
    id: string
    name: string
    avatarUrl: string
  }
  orderProduct: { id: string; options: any }
  meetGenerationMethod: MeetGenerationMethod
}
