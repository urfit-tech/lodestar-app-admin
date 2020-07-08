type CategoryProps = {
  id: string
  name: string
  position: number
}

type ActivitySessionProps = {
  id: string
  title: string
  description: string | null
  threshold: number | null
  startedAt: Date
  endedAt: Date
  location: string
  activityId: string
}

type ActivitySessionTicketProps = {
  id: string
  session: ActivitySessionProps
}

type ActivityTicketProps = {
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

  categories: CategoryProps[]
  sessions: ActivitySessionProps[]
  tickets: ActivityTicketProps[]
}
