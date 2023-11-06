import { PeriodType } from './general'

export type ReservationType = 'hour' | 'day'
export type MeetGenerationMethod = 'auto' | 'manual'
export type RescheduleType = 'hour' | 'day'
export type MeetGateway = 'jitsi' | 'zoom'

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
  reservationType: 'hour' | 'day' | null
  capacity: number
  meetGenerationMethod: string
  defaultMeetGateway: MeetGateway
  rescheduleAmount: number
  rescheduleType: RescheduleType
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
  | 'defaultMeetGateway'
  | 'rescheduleAmount'
  | 'rescheduleType'
> & {
  schedules: Pick<AppointmentSchedule, 'id' | 'startedAt' | 'intervalAmount' | 'intervalType' | 'excludes'>[]
  periods: (Pick<AppointmentPeriod, 'appointmentPlanId' | 'appointmentScheduleId' | 'startedAt' | 'endedAt'> & {
    isEnrolled?: boolean
    isExcluded?: boolean
    onClick?: () => void
    targetMemberBooked?: boolean
    isBookedReachLimit?: boolean
  })[]
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
  defaultMeetGateway: MeetGateway
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
  appointmentPlan: Pick<
    AppointmentPlan,
    'id' | 'title' | 'duration' | 'rescheduleAmount' | 'rescheduleType' | 'defaultMeetGateway'
  >
  startedAt: Date
  endedAt: Date
  canceledAt: Date | null
  creator: {
    id: string
    name: string
    avatarUrl: string | null
  }
  orderProduct: { id: string; options: any }
  meetGenerationMethod: MeetGenerationMethod
}
