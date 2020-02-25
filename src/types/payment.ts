export type DiscountType = 'None' | 'Coupon' | 'Card'
export type Discount = {
  type: DiscountType
  target: string
}

export type OrderProduct = {
  id: string
  name: string
  description: string
  price: number
  endedAt: Date | null
  startedAt: Date | null
  autoRenewed: boolean
  product: Product
}

type Product = {
  type: string
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
}

export type CartProduct = {
  id: string
  productId: string
  createdAt?: string
  price?: number
}
