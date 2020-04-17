import { InferType, number, object, string } from 'yup'

export type UserRole = 'app-owner' | 'content-creator' | 'general-member' | 'anonymous'
export type AuthState = 'login' | 'register' | 'forgotPassword' | 'confirm'

export const appSchema = object({
  id: string(),
  name: string(),
  title: string().nullable(),
  description: string().nullable(),
  ogTitle: string().nullable(),
  ogUrl: string().nullable(),
  ogImage: string().nullable(),
  ogDescription: string().nullable(),
  pointExchangeRate: number(),
  pointDiscountRatio: number(),
  pointValidityPeriod: number().nullable(),
}).camelCase()
export type App = InferType<typeof appSchema>

export const productTargetSchema = object({
  programId: string().notRequired(),
  programPlanId: string().notRequired(),
  programContentId: string().notRequired(),
  projectPlanId: string().notRequired(),
  activityTicketId: string().notRequired(),
}).camelCase()
export type ProductTarget = InferType<typeof productTargetSchema>

export const cartProductSchema = object({
  id: string(),
  product_id: string(),
  created_at: string(),
}).camelCase()
export type CartProduct = InferType<typeof cartProductSchema>

