import { ProductType } from 'lodestar-app-element/src/types/product'

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
  count?: number
  remaining?: number
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
  status: {
    used: boolean
    outdated: boolean
  }
  couponCode?: {
    code: string
    couponPlan: CouponPlanProps
  }
}

export type VoucherPlanBriefProps = {
  id: string
  title: string
  startedAt: Date | null
  endedAt: Date | null
  productQuantityLimit: number
  isTransferable: boolean
  available?: boolean
  count: number
  remaining: number
  sale?: { amount: number; price: number }
  category?: { id: string; name: string }
  pinCode: string | null
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

export type OrderProductProps = {
  productId: string
  name: string
  description: string
  price: number
  endedAt: Date | null
  startedAt: Date | null
  autoRenewed: boolean
  options?: {
    quantity?: number
    currencyId?: string
    currencyPrice?: number
  }
}

export type OrderDiscountProps = {
  name: string
  type: string | null
  target: string | null
  description: string | null
  price: number
  options: { [key: string]: any } | null
}

export type shippingOptionProps = {
  id: string
  fee: number
  days: number
  enabled: boolean
}

export type shippingOptionIdProps = 'sevenEleven' | 'familyMart' | 'okMart' | 'sendByPost' | 'homeDelivery'

export type CheckProps = {
  orderProducts: OrderProductProps[]
  orderDiscounts: OrderDiscountProps[]
  shippingOption: shippingOptionProps | null
}
