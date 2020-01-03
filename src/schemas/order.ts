import { array, boolean, date, number, object, string } from 'yup'

export const orderItemSchema = object({
  // will be deprecated
  id: string(),
  class: string(),
  name: string(),
  price: number(),
  endedAt: date().nullable(),
}).camelCase()

export const productSchema = object({
  id: string(),
  type: string(),
  target: string(),
}).camelCase()

export const orderProductSchema = object({
  id: string(),
  orderId: string(),
  productId: string(),
  name: string(),
  description: string().nullable(),
  price: number(),
  startedAt: date().nullable(),
  endedAt: date().nullable(),
  autoRenewed: boolean().nullable(),
  createdAt: date(),

  product: productSchema,
}).camelCase()

export const orderDiscountSchema = object({
  id: string(),
  orderId: string(),
  name: string(),
  description: string().nullable(),
  price: number(),
}).camelCase()

export const orderSchema = object({
  id: string(),
  memberId: string(),
  createdAt: date(),
  status: string(),

  orderProducts: array(orderProductSchema).default([]),
  orderDiscounts: array(orderDiscountSchema).default([]),

  // will be deprecated
  discountType: number(),
  discountPoint: number().default(0),
  discountPrice: number().default(0),
  orderItems: array(orderItemSchema).default([]),
}).camelCase()
