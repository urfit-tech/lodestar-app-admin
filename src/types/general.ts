export type AuthState = 'login' | 'register' | 'forgotPassword' | 'confirm'
export type ClassType =
  | 'program'
  | 'podcastProgram'
  | 'activity'
  | 'post'
  | 'merchandise'
  | 'programPackage'
  | 'task'
  | 'member'
  | 'creator'
export type ProductType =
  | 'Program'
  | 'ProgramPlan'
  | 'ProgramContent'
  | 'ProgramPackagePlan'
  | 'ProjectPlan'
  | 'Card'
  | 'ActivityTicket'
  | 'Merchandise'
  | 'MerchandiseSpec'
  | 'PodcastProgram'
  | 'PodcastPlan'
  | 'AppointmentPlan'

export type PermissionType = 'funding' | 'preOrder' | 'onSale'
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

type OrderProductProps = {
  id: string
  name: string
  price: number
  startedAt: Date | null
  endedAt: Date | null
  product: {
    id: string
    type: string
  }
  quantity: number
  options: any
}

type OrderDiscountProps = {
  id: string
  name: string
  description: string | null
  price: number
}

export type OrderLogProps = {
  id: string
  createdAt: Date
  status: string
  shipping: any
  name: string
  email: string
  totalPrice: number
  expiredAt: Date
  paymentMethod: string | null

  orderProducts: OrderProductProps[]
  orderDiscounts: OrderDiscountProps[]
  orderExecutors: string[]
}
