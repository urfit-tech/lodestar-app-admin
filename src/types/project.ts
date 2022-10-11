import { CreatorProps } from './creator'
import { CategoryProps } from './general'

export type ProjectDataType = 'funding' | 'pre-order' | 'on-sale' | 'modular' | 'portfolio'
export type ProjectPlanPeriodType = 'D' | 'W' | 'M' | 'Y'
export type ProjectAdminProps = ProjectPreviewProps & {
  categories: CategoryProps[]
  tags: string[]
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
  projectPlan: ProjectPlan[]
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
  creator?: Pick<CreatorProps, | 'id' | 'name'> | null
}

export type ProjectPlanType = 'perpetual' | 'period' | 'subscription'

export type ProjectPlan = {
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
  products: ProjectPlanProduct[]
}
export type ProjectPlanProduct = {
  id: string
  options: { [key: string]: any }
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
