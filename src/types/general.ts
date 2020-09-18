export type AuthState = 'login' | 'register' | 'forgotPassword' | 'confirm'
export type ClassType = 'program' | 'podcastProgram' | 'activity' | 'post' | 'merchandise' | 'programPackage'
export type ProductType =
  | 'Program'
  | 'ProgramPlan'
  | 'ProgramContent'
  | 'ProgramPackagePlan'
  | 'ProjectPlan'
  | 'Card'
  | 'ActivityTicket'
  | 'Merchandise'
  | 'PodcastProgram'
  | 'PodcastPlan'
  | 'AppointmentPlan'

export type ProductProps = {
  id: string
  title: string
  type: ProductType
  children?: ProductProps[]
}

export type CategoryProps = {
  id: string
  name: string
}

export type IssueProps = {
  id: string
  title: string
  description: string
  solvedAt: Date | null
  createdAt: Date
  issueMemberId: string
  threadId: string
  reactedMemberIds: string[]
  issueRepliesCount: number
  issueInstructorIds?: string[]
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
