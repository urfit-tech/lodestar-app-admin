export type CategoryProps = {
  id: string
  name: string
  class?: string
  position: number
}

export type ActivityCategoryProps = {
  id: string
  category: CategoryProps
}

export type ActivitySessionProps = {
  id: string
  title: string
  description: string | null
  threshold: number | null
  startedAt: Date
  endedAt: Date
  locatino: string
  activityId: string
}

export type ActivitySessionTicketProps = {
  id: string
  session: ActivitySessionProps
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

  sessionTickets: ActivitySessionTicketProps[]
}

export type ActivityProps = {
  id: string
  coverUrl: string | null
  title: string
  description: string
  isParticipantsVisible: boolean
  publishedAt: Date
  startedAt: Date | null
  endedAt: Date | null
  link: string
  organizerId: string
  appId: string

  categories: ActivityCategoryProps[]
  sessions: ActivitySessionProps[]
  tickets: ActivityTicketProps[]
}
