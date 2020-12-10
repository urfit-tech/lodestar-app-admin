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

export type VoucherPlanBriefProps = {
  id: string
  title: string
  startedAt: Date | null
  endedAt: Date | null
  productQuantityLimit: number

  available?: boolean
  action?: React.ReactNode
}

export type VoucherPlanProps = VoucherPlanBriefProps & {
  description: string | null
  count: number
  remaining: number
  productIds: string[]
}

export type VoucherCodeProps = {
  id: string
  code: string
  count: number
  remaining: number

  used?: number
}

export type VoucherProps = {
  id: string

  used?: boolean
}
