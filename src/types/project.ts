import { CategoryProps } from './general'

export type ProjectDataType = 'funding' | 'pre-order' | 'on-sale' | 'modular'
export type ProjectPlanPeriodType = 'D' | 'W' | 'M' | 'Y'
export type ProjectAdminProps = {
  id: string
  title: string
  abstract: string | null
  categories: CategoryProps[]
  introduction: string | null
  description: string | null
  targetAmount: number
  targetUnit: string
  projectType: ProjectDataType
  updates: string | null
  createdAt: Date | null
  publishedAt: Date | null
  expiredAt: Date | null
  comments: string | null
  contents: string | null
  coverType: string | null
  coverUrl: string | null
  previewUrl: string | null
  isParticipantsVisible: boolean
  isCountdownTimerVisible: boolean
  projectPlan: ProjectPlanProps[]
}

export type ProjectPreviewProps = {
  id: string
  title: string
  abstract: string | null
  projectType: ProjectDataType
  createdAt: Date | null
  publishedAt: Date | null
  expiredAt: Date | null
  coverUrl: string | null
  previewUrl: string | null
  totalCount: number
  coverType: string | null
}

export type ProjectPlanProps = {
  id: string
  projectId: string
  coverUrl: string | null
  title: string
  description: string | null
  listPrice: number
  salePrice: number
  soldAt: Date | null
  discountDownPrice: number
  isSubscription: boolean
  periodAmount: number | null
  periodType: string | null
  position: number | null
  isParticipantsVisible: boolean
  isPhysical: boolean
  isLimited: boolean
  publishedAt: Date | null
  autoRenewed: boolean
  projectPlanEnrollment: number
}
export type ProjectSortProps = {
  id: string
  title: string
}
export type ProjectPlanSortProps = {
  id: string
  projectId: string
  title: string
}

export type ProjectPlanProps = {
  id: string
  projectId: string
  coverUrl: string | null
  title: string
  description: string | null
  listPrice: number
  salePrice: number
  soldAt: Date | null
  discountDownPrice: number
  isSubscription: boolean
  periodAmount: number | null
  periodType: string | null
  position: number | null
  isParticipantsVisible: boolean
  isPhysical: boolean
  isLimited: boolean
  publishedAt: Date | null
  autoRenewed: boolean
}

export type ProjectSortProps = {
  id: string
  projectId: string
  title: string
}
