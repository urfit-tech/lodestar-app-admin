export type UserRole = 'app-owner' | 'content-creator' | 'general-member' | 'anonymous'
export type AuthState = 'login' | 'register' | 'forgotPassword' | 'confirm'
export type ClassType = 'program' | 'podcastProgram' | 'activity' | 'post' | 'merchandise' | 'programPackage'
export type ProductType =
  | 'Program'
  | 'ProgramPlan'
  | 'ProgramContent'
  | 'ProgramPackage'
  | 'ProgramPackagePlan'
  | 'ProjectPlan'
  | 'Card'
  | 'ActivityTicket'
  | 'Merchandise'
  | 'PodcastProgram'
  | 'PodcastPlan'
  | 'AppointmentPlan'

export type Product = {
  id: string
  title: string
  type: ProductType
  children?: Product[]
}

export type Category = {
  id: string
  name: string
  position: number
}

export type Member = {
  id: string
  name: string
  email: string
  username: string
  pictureUrl: string | null
  description: string | null
  abstract: string | null
  title: string | null
  memberTags?: {
    id: string
    tagName: string
  }[]
  role: string
}

export type MemberPublic = {
  id: string
  name: string
  username: string
  pictureUrl: string
  description: string
  role: string
}

export type MemberBrief = {
  id: string
  avatarUrl: string | null
  name: string
  email: string
}

export type Issue = {
  id: string
  title: string
  description: string
  solvedAt: Date | null
  createdAt: Date
  memberId: string
  threadId: string
  reactedMemberIds: Array<string>
  issueRepliesCount: number
}

export type PeriodType = 'D' | 'W' | 'M' | 'Y'

export type ProductInventoryStatusProps = {
  buyableQuantity: number
  undeliveredQuantity: number
  deliveredQuantity: number
}

export type ProductInventoryLogProps = {
  id: string
  createdAt: Date
  status: string | null
  specification: string | null
  quantity: number
  comment: string | null
}
