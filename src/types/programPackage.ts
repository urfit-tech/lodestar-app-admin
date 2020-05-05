import { PeriodType } from './general'

export type ProgramPackageProps = {
  programPackage: {
    id: string
    title: string | null
    coverUrl: string | null
    publishedAt: string | null
    description: string | null
    programs: ProgramPackageProgramProps[]
    plans: ProgramPackagePlanProps[]
  }
  onRefetch?: () => void
}

export type ProgramPackageProgramProps = {
  id: string
  title: string
  coverUrl: string
  position: number
}

export type ProgramPackagePlanProps = {
  id: string
  title: string
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  discountDownPrice: number
  description: string | null
  soldQuantity: number
  isSubscription: boolean
  periodAmount: number
  periodType: PeriodType
  publishedAt: Date
  isTempoDelivery: boolean
  position: number
}

