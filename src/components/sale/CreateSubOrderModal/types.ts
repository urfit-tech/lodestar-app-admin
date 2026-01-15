export type EditableOrderProduct = {
  id: string
  productId?: string
  name: string
  price: number
  type: string
  target?: string
  currencyId?: string
  currencyPrice?: number
  quantity?: number
  options?: any
  isNew?: boolean
}

export type EditableOrderDiscount = {
  id: string
  name: string
  price: number
  type: string
  target?: string
  coins?: number
  isNew?: boolean
}

export type EditablePaymentLog = {
  id: string
  no?: string
  price: number
  status: string | null | undefined
  gateway?: string | null
  method?: string | null
  isNew?: boolean
}
