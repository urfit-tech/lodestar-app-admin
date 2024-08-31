import { InvoiceProps } from './merchandise'

export type Device = 'desktop' | 'tablet' | 'mobile'
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
  | 'voucher'

export type Category = {
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

export type PeriodType = 'H' | 'm' | 'D' | 'W' | 'M' | 'Y'

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

export type OrderProduct = {
  id: string
  name: string
  price: number
  startedAt: Date | null
  endedAt: Date | null
  deliveredAt: Date | null
  product: {
    id: string
    type: string
  }
  quantity: number
  options: any
}

export type OrderDiscount = {
  id: string
  name: string
  description: string | null
  price: number
  type: string
  target: string
  options: any
}

export type OrderLog = {
  id: string
  createdAt: Date
  status: string
  shipping: any
  name: string
  email: string
  totalPrice: number
  expiredAt: Date
  paymentMethod: string | null
  orderProducts: OrderProduct[]
  orderDiscounts: OrderDiscount[]
  orderExecutors: { ratio: string; name: string }[]
  options?: {
    ip?: string
    country?: string
    countryCode?: string
    installmentPlans?: { price: number; index: number; endedAt?: string }[]
    paymentMode?: string
    company?: string
  }
  invoiceOptions?: InvoiceProps
  invoiceIssuedAt?: Date
}

export type PaymentLog = {
  no: string
  createdAt: Date | null
  status: string
  price: number
  gateway: string
  paidAt: Date | null
  method: string
  customNo: string | null
  invoice_options?: InvoiceProps
  options?: any
}

export type PermissionGroupProps = {
  id: string
  name: string
  permissionGroupPermissions: PermissionGroupPermission[]
}

export type PermissionGroupPermission = {
  id: string
  permissionId: string
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
  data: any
}

export type MetaTag = {
  seo?: { pageTitle?: string; description?: string; keywords?: string }
  openGraph?: { title?: string; description?: string; image?: string; imageAlt?: string }
}

export type UploadState = 'idle' | 'uploading' | 'upload-success' | 'upload-error'
