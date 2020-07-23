import { ProductType } from './general'

export type CouponPlanType = 'cash' | 'percent'

export type CouponPlanProps = {
  id: string
  title: string
  description: string | null
  scope: ProductType[]
  type: CouponPlanType | null
  amount: number
  constraint: number | null
  startedAt: Date | null
  endedAt: Date | null
  count: number
  remaining: number
  available?: boolean
  productIds?: string[]
}

export type CouponCodeProps = {
  id: string
  code: string
  count: number
  remaining: number
  used: number
}

export type CouponProps = {
  id: string
  member: {
    id: string
    email: string
  }
  used: boolean
}

export type VoucherPlanProps = VoucherProps & {
  voucherCodes: VoucherCodeProps[]
  count: number
  remaining: number
  productIds: string[]
}

export type VoucherCodeProps = {
  id: string
  code: string
  count: number
  remaining: number
}

export type VoucherProps = {
  id: string
  title: string
  description: string | null
  startedAt?: Date
  endedAt?: Date
  productQuantityLimit: number
  available: boolean
  extra?: React.ReactNode
  action?: React.ReactNode
}
