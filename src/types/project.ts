import { CategoryProps } from './general'

export type ProjectDataType = 'funding' | 'pre-order' | 'on-sale' | 'modular'
export type ProjectPlanPeriodType = 'D' | 'W' | 'M' | 'Y'
export type ProjectAdminProps = ProjectPreviewProps & {
  categories: CategoryProps[]
  introduction: string | null
  introductionDesktop: string | null
  description: string | null
  targetAmount: number
  targetUnit: string
  updates: string | null
  comments: string | null
  contents: string | null
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
  coverType: string | null
  totalCount?: number
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
  currencyId: string
}

export type ProjectPlanSortProps = {
  id: string
  projectId: string
  title: string
}

export type ProjectSortProps = {
  id: string
  title: string
}
