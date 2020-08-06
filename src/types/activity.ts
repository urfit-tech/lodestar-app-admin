export type ActivityBriefProps = {
  id: string
  coverUrl: string | null
  title: string
  publishedAt: Date | null
  participantsCount?: number
  startedAt?: Date | null
  endedAt?: Date | null
}

export type ActivityProps = ActivityBriefProps & {
  description: string
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
}

export type ActivitySessionProps = {
  id: string
  title: string
  description: string | null
  threshold: number | null
  startedAt: Date
  endedAt: Date
  location: string
}
