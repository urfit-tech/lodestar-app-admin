export type AuthState = 'login' | 'register' | 'forgotPassword' | 'confirm'
export type ClassType =
  | 'program'
  | 'project'
  | 'podcastProgram'
  | 'activity'
  | 'post'
  | 'merchandise'
  | 'programPackage'
  | 'task'
  | 'member'
  | 'creator'
  | 'podcastAlbum'
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
  | 'PodcastAlbum'

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
  unpaidQuantity: number
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

export type PermissionGroupProps = {
  id: string
  name: string
  permissionIds: string[]
}

export type Member = {
  id: string
  email: string
  name: string
  username: string
  pictureUrl: string | null
}
export type Attachment = {
  id: string
  name: string
  filename: string
  contentType: string
  size: number
  duration: number
  status: string
  author: Member
  thumbnailUrl: string | null
  createdAt: Date
  updatedAt: Date
  options: any
}

export type UploadState = 'idle' | 'uploading' | 'upload-success' | 'upload-error'
