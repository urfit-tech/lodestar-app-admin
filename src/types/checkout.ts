export type CouponPlanType = 1 | 2

export type CouponPlanProps = {
  id: string
  title: string
  description: string | null
  scope: string | null
  type: CouponPlanType
  amount: number
  constraint: number | null
  startedAt: Date | null
  endedAt: Date | null
  count: number
  remaining: number
  available?: boolean
}

export type CouponCodeProps = {
  id: string
  code: string
  count: number
  used: number
}

export type CouponProps = {
  id: string
  member: {
    id: string
    email: string
  }
}
