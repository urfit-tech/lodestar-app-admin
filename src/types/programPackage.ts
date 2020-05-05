import { PeriodType } from './general'

export type ProgramPackage = {
  title: string | null
  coverUrl: string | null
  publishedAt: string | null
  description: string | null
  programs: ProgramPackageProgramCollection
  plans: ProgramPackagePlan[]
}

export type ProgramPackageCollection = {
  id: string
  coverUrl?: string | null
  title: string
  publishedAt: Date
  soldQuantity: number
}[]

export type ProgramPackageProgramCollection = {
  id: string
  title: string
  coverUrl: string
  position: number
}[]

export type ProgramPackagePlan = {
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

export type ProgramPackageProps = {
  programPackage: { id: string } & ProgramPackage
  onRefetch?: () => void
}

export type ProgramPackageProgramProps = {
  programs: {
    id: string
    title: string
  }[]
  onRefetch?: () => void
}
