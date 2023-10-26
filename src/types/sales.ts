export type LeadStatus =
  | 'IDLED'
  | 'CONTACTED'
  | 'INVITED'
  | 'PRESENTED'
  | 'TODO'
  | 'SIGNED'
  | 'CLOSED'
  | 'DEDICATED'
  | 'EXISTED'
  | 'DEAD'
  | 'FOLLOWED'
  | 'ANSWERED'
  | 'COMPLETED'

export type Manager = {
  id: string
  avatarUrl: string | null
  name: string
  username: string
  email: string
  // disabled?: boolean
  telephone: string
}

export type LeadProps = {
  id: string
  name: string
  email: string
  phones: string[]
  pictureUrl: string
  notes: string
  categoryNames: string[]
  properties: { id: string; name: string; value: string }[]
  star: number
  createdAt: Date
  assignedAt: Date | null
  status: LeadStatus
  notified: Boolean
  recentContactedAt: Date | null
  recentAnsweredAt: Date | null
  completedAt: Date | null
  closedAt: Date | null
  followedAt: Date | null
  excludedAt: Date | null
  recycledAt: Date | null
}

export type SalesProps = {
  id: string
  pictureUrl: string | null
  name: string
  email: string
  telephone: string | null
  metadata: any
  baseOdds: number
  lastAttend: {
    startedAt: Date
    endedAt: Date
  } | null
  sharingOfMonth: number
  sharingOrdersOfMonth: number
  totalDuration: number
  totalNotes: number
}

export type SalesCallMemberProps = {
  id: string
  name: string
  email: string
  phones: string[]
  categoryNames: string[]
  lastContactAt: Date | null
  lastTask: { dueAt: Date | null; categoryName: string | null } | null
  contracts: {
    projectPlanName: string
    endedAt: Date
  }[]
}

export type CurrentLeadProps = {
  id: string
  email: string
  name: string
  createdAt: Date | null
  phones: string[]
  categories: {
    id: string
    name: string
  }[]
  properties: {
    id: any
    name: string
    value: string
  }[]
}
export type SalesStatus = {
  name: string
  data: {
    id: string
    name: string
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    callTimes: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    callDuration: {
      today: number
      thisWeek: number
      thisMonth: number
    }
  }[]
}[]

export type SalesMemberProps = {
  id: string
  name: string
}

export type GroupSettingProps = {
  name: string
  sales: SalesMemberProps[]
}
