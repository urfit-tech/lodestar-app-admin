export type Contract = {
  id: string
  title: string
  values: ContractValue | null
  startedAt: Date | null
  endedAt: Date | null
  agreedAt: Date | null
  createdAt: Date
  agreedIp: string | null
  agreedOptions: any
  options: any
  revokedAt: Date | null
}
export type ContractWithProducts = Contract & {
  orderProducts: {
    productId: string
    name: string
  }[]
  coinLogs: {
    id: string
    amount: number
    title: string
  }[]
  coupons: {
    id: string
    code: string
    couponPlanId: string
  }[]
}

export type ContractValue = {
  price: number
  coupons: {
    id: string
    member_id: string
    coupon_code?: {
      data: {
        code: string
        count: number
        app_id: string
        remaining: number
        coupon_plan?: {
          data: {
            id: string
            type: number
            scope: string[]
            title: string
            amount: number
            ended_at: string
            started_at: string
            description: string
          }
          on_conflict?: {
            constraint: string
            update_columns: string[]
          }
        }
        coupon_plan_id?: string
      }
    }
  }[]
  invoice: {
    name: string
    email: string
    phone: string
  }
  orderId: string
  coinLogs: {
    id: string
    title: string
    amount: number
    ended_at: string
    member_id: string
    started_at: string
    description: string
  }[]
  memberId: string
  paymentNo: string
  orderOptions: {
    recognizePerformance: number
  }
  orderProducts: {
    name: string
    price: number
    ended_at: string
    product_id: string
    started_at: string
    delivered_at: string
    options?: any
  }[]
  orderDiscounts: any[]
  orderExecutors: {
    ratio: number
    member_id: string
  }[]
  paymentOptions: {
    paymentMethod: string
    installmentPlan: number
  }
}
