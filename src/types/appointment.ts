import { PeriodType } from './general'

export type ReservationType = 'hour' | 'day'
export type MeetGenerationMethod = 'auto' | 'manual'

export type AppointmentPlan = {
  id: string
  title: string
  description: string | null
  duration: number
  price: number
  createdAt: Date
  updatedAt: Date
  creatorId: string
  publishedAt: Date | null
  phone: string | null
  supportLocales: string[]
  currencyId: string
  isPrivate: boolean
  reservationAmount: number
  reservationType: string | null
  capacity: number
  meetGenerationMethod: string
  defaultMeetSystem: string
}

export type AppointmentPlanAdminProps = {
  id: string
  title: string
  phone: string
  description: string | null
  duration: number
  listPrice: number
  schedules: AppointmentSchedule[]
  periods: AppointmentPeriod[]
  isPublished: boolean | null
  supportLocales: string[]
  currencyId: string
  creatorId: string
  isPrivate: boolean
  reservationAmount: number
  reservationType: ReservationType | null
  // capacity=-1 represents no limit
  capacity: number
  meetGenerationMethod: MeetGenerationMethod
}

export type AppointmentPeriod = {
  appointmentPlanId: string
  appointmentScheduleId: string
  startedAt: Date
  endedAt: Date
  available: boolean
  booked: number
}

export type AppointmentSchedule = {
  id: string
  appointmentPlanId: string
  startedAt: Date
  intervalType: PeriodType | null
  intervalAmount: number | null
  excludes: Date[]
  createdAt: Date
  updatedAt: Date
}

export type AppointmentPlanAdmin = Pick<
  AppointmentPlan,
  | 'id'
  | 'title'
  | 'phone'
  | 'description'
  | 'duration'
  | 'price'
  | 'reservationAmount'
  | 'reservationType'
  | 'capacity'
  | 'meetGenerationMethod'
  | 'publishedAt'
  | 'supportLocales'
  | 'currencyId'
  | 'creatorId'
  | 'isPrivate'
  | 'defaultMeetSystem'
> & {
  schedules: Pick<AppointmentSchedule, 'id' | 'startedAt' | 'intervalAmount' | 'intervalType' | 'excludes'>[]
  periods: (Pick<AppointmentPeriod, 'appointmentPlanId' | 'appointmentScheduleId' | 'startedAt' | 'endedAt'> & {
    isEnrolled: boolean
    isExcluded: boolean
  })[]
}
