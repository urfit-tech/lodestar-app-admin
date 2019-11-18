export type DiscountType = 'None' | 'Coupon' | 'Card'
export type Discount = {
  type: DiscountType
  target: string
}

export type OrderProduct = {
  name: string
  description: string
  price: number
  endedAt: Date | null
  startedAt: Date | null
  autoRenewed: boolean
}

export type OrderDiscount = {
  name: string
  type: string
  description: string
  target: string
  price: number
}

export type Check = {
  orderProducts: Array<OrderProduct>
  orderDiscounts: Array<OrderDiscount>
} | undefined

export type CartProduct = {
  product_id: string
  id: string
  price?: number
}