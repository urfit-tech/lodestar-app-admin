import { array, date, InferType, mixed, number, object, string } from 'yup'

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

export const memberSchema = object({
  id: string(),
  appId: string(),
  role: mixed<UserRole>(),
  username: string(),
  name: string().nullable(),
  email: string(),
  pictureUrl: string().nullable(),
  metadata: object().nullable(),
  description: string().nullable(),
  title: string().nullable(),
  abstract: string().nullable(),
  createdAt: date(),
  loginedAt: date(),
  memberTags: array(
    object({
      id: string(),
      tagName: string(),
    }).camelCase(),
  ),
  facebookUserId: string().nullable(),
  googleUserId: string().nullable(),
  zoomUserId: string().nullable(),
}).camelCase()
export type Member = InferType<typeof memberSchema>
