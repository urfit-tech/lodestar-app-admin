import { CategoryProps } from './general'

export type ActivityBriefProps = {
  id: string
  coverUrl: string | null
  title: string
  publishedAt: Date | null
  participantsCount?: number
  startedAt?: Date | null
  endedAt?: Date | null
}

type ActivityProps = ActivityBriefProps & {
  description: string | null
  isParticipantsVisible: boolean
  organizerId: string
  supportLocales: string[]
}

export type ActivityTicketProps = {
  id: string
  title: string
  startedAt: Date
  endedAt: Date
  price: number
  count: number
  description: string | null
  isPublished: boolean
  enrollmentsCount?: number
}

export type ActivitySessionProps = {
  id: string
  title: string
  startedAt: Date
  endedAt: Date
  location: string | null
  onlineLink: string | null
  threshold: number | null
  description: string | null
  enrollmentsCount?: number
}

export type ActivityAdminProps = ActivityProps & {
  categories: CategoryProps[]
  tickets: (ActivityTicketProps & {
    sessions: {
      id: string
      title: string
    }[]
  })[]
  sessions: ActivitySessionProps[]
}
