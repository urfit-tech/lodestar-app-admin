export type LeadProps = {
  appId: string
  id: string
  name: string
  email: string
  phones: {
    phoneNumber: string
    isValid: boolean
  }[]
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
  leadStatusCategoryId: string
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

export type Manager = {
  id: string
  avatarUrl: string | null
  name: string
  username: string
  email: string
  // disabled?: boolean
  telephone: string
}

export type ManagerSelectorStatus =
  | 'default'
  | 'onlySameDivision'
  | 'onlySamePermissionGroup'
  | 'bothPermissionGroupAndDivision'

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
  | 'LASTCREATED'

export type MemberTask = {
  memberId: string
  status: string
}

export type MemberProperty = {
  name: string
  memberId: string
  propertyId: string
  value: string
}

export type MemberPhone = {
  memberId: string
  phone: string
}

export type MemberNote = {
  memberId: string | null
  description: string | null
}

export type MemberCategory = {
  name: string
  memberId: string
  categoryId: string
}

export type MemberContract = {
  memberId: string
  agreedAt: Date | null
  revokedAt: Date | null
  values: any | null
}

export type ApiResponse = {
  data: {
    member_task: Array<{
      memberId: string
      status: string
    }>
    member_property: Array<{
      memberId: string
      propertyId: string
      value: string
    }>
    member_phone: Array<{
      memberId: string
      phone: string
    }>
    active_member_contract: Array<{
      memberId: string
      agreed_at: string | null
      revoked_at: string | null
      values: any | null
    }>
  }
}

export type SalesLeadMember = {
  id: string
  appId: string
  name: string
  email: string
  pictureUrl: string
  star: number | null
  createdAt: Date | null
  assignedAt: Date | null
  followedAt: Date | null
  closedAt: Date | null
  completedAt: Date | null
  excludedAt: Date | null
  recycledAt: Date | null
  notified: Boolean
  recentContactedAt: Date | null
  recentAnsweredAt: Date | null
  leadStatusCategoryId: string
  properties: {
    id: string
    name: string
    value: string
  }[]
  phones: {
    phoneNumber: string
    isValid: boolean
  }[]
  latestNoteDescription: string
  memberNoteOutboundCount: number
  categoryNames: string[]
  status: LeadStatus
  callbackedAt: Date | null
  rating: number
}
