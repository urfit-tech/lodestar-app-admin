import { PeriodType, Category, MetaTag } from './general'

export type ProgramPackageProps = {
  id: string
  title: string | null
  coverUrl: string | null
  publishedAt: string | null
  description: string | null
  metaTag: MetaTag
  programs: ProgramPackageProgramProps[]
  plans: ProgramPackagePlanProps[]
  categories: Category[]
  tags: string[]
  isPrivate: boolean
}

export type ProgramPackageProgramProps = {
  id: string
  program: {
    id: string
    title: string
    coverUrl: string | null
    publishedAt: string | null
  }
  position: number
}

export type ProgramPackagePlanProps = {
  id: string
  title: string
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  discountDownPrice: number | null
  description: string | null
  soldQuantity: number
  isSubscription: boolean
  periodAmount: number
  periodType: PeriodType
  publishedAt: Date | null
  isTempoDelivery: boolean
  isParticipantsVisible: boolean
  position: number
  remindPeriodAmount: number | null | undefined
  remindPeriodType: string | null | undefined
}
