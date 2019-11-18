import { bool, date, number, object, string } from 'yup'

export const couponPlanTypeSchema = number().oneOf([1, 2])
export const couponPlanSchema = object({
  id: string(),
  startedAt: date().nullable(),
  endedAt: date().nullable(),
  scope: string().oneOf(['all']),
  type: couponPlanTypeSchema,
  constraint: number(),
  amount: number(),
  title: string(),
  description: string().nullable(),
  count: number(),
  remaining: number(),
}).camelCase()
export const couponCodeSchema = object({
  code: string(),
  couponPlan: couponPlanSchema,
}).camelCase()
export const couponSchema = object({
  id: string(),
  couponCode: couponCodeSchema,
  status: object({
    used: bool(),
    outdated: bool(),
  }),
}).camelCase()

export const discountValueSchema = object({
  type: string(),
  target: string(),
}).camelCase()
