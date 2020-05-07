import { PeriodType } from './general'

export type ProgramPackageProps = {
  id: string
  title: string | null
  coverUrl: string | null
  publishedAt: string | null
  description: string | null
  programs: ProgramPackageProgramProps[]
  plans: ProgramPackagePlanProps[]
}

export type ProgramPackageProgramProps = {
  id: string
  program: {
    id: string
    title: string
    coverUrl: string | null
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
  position: number
}
