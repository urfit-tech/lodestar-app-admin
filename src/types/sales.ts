export type LeadProps = {
  id: string
  name: string
  email: string
  phones: string[]
  categoryNames: string[]
  properties: { id: string; name: string; value: string }[]
  paid: number
  star: number
  createdAt: Date
  status: 'IDLED' | 'CONTACTED' | 'INVITED' | 'PRESENTED' | 'SIGNED' | 'CLOSED' | 'DEDICATED' | 'EXISTED'
  notified: Boolean
  recentTaskedAt: Date | null
  recentContactedAt: Date | null
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

export type Lead = {
  id: string
  name: string
  email: string
  phones: string[]
  categoryNames: string[]
  paid: number
  star: number
  createdAt: Date
  status: 'IDLED' | 'CONTACTED' | 'INVITED' | 'PRESENTED' | 'PAID' | 'CLOSED'
  notified: Boolean
}

export type SalesMemberProps = {
  id: string
  name: string
}

export type GroupSettingProps = {
  name: string
  sales: SalesMemberProps[]
}
