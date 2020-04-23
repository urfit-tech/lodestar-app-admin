import { array, bool, boolean, date, mixed, number, object, string } from 'yup'

export const categorySchema = object({
  id: string(),
  name: string(),
  position: number(),
}).camelCase()
export const programCategorySchema = object({
  id: string(),
  category: categorySchema,
  position: number(),
})

export type ProgramRoleName = 'owner' | 'instructor' | 'assistant'
export const programRoleSchema = object({
  id: string(),
  name: mixed<ProgramRoleName>(),
  member: object({
    id: string(),
    name: string().nullable(),
    pictureUrl: string().nullable(),
  }).camelCase(),
}).camelCase()

export type ProgramPlanPeriodType = 'W' | 'M' | 'Y'
export const programPlanSchema = object({
  id: string(),
  type: number().oneOf([1, 2]),
  title: string(),
  description: string(),
  gains: string().nullable(),
  salePrice: number(),
  discountDownPrice: number(),
  listPrice: number(),
  soldAt: date().nullable(),
  periodType: mixed<ProgramPlanPeriodType>(),
}).camelCase()

export const programContentBodySchema = object({
  id: string(),
  type: string().nullable(),
  data: mixed().nullable(),
  description: string().nullable(),
}).camelCase()
export const programContentPlanSchema = object({
  id: string(),
  programPlan: programPlanSchema,
}).camelCase()
export const programContentSchema = object({
  id: string(),
  title: string().nullable(),
  abstract: string().nullable(),
  createdAt: date(),
  publishedAt: date().nullable(),
  price: number().nullable(),
  programContentBody: programContentBodySchema.nullable(),
  programContentPlans: array(programContentPlanSchema).default([]),
  programContentProgress: array(
    object({
      id: string(),
      progress: number(),
    }),
  ).nullable(),
  programContentType: object({
    id: string(),
    type: string().nullable(),
  }),
  duration: number().nullable(),
  metadata: mixed().nullable(),
  position: number().nullable(),
  isNotifyUpdate: boolean(),
  notifiedAt: date().nullable(),
})
  .camelCase()
  .from('listPrice', 'price')
  .from('salePrice', 'price')

export const programContentSectionSchema = object({
  id: string(),
  title: string(),
  programContents: array(programContentSchema).default([]),
  position: number().nullable(),
}).camelCase()
export const programSchema = object({
  id: string().required(),
  title: string().nullable(),
  abstract: string().nullable(),
  description: string().nullable(),
  coverUrl: string().nullable(),
  coverVideoUrl: string().nullable(),
  createdAt: date(),
  publishedAt: date().nullable(),
  isSubscription: bool(),
  inAdvance: bool(),
  appId: string(),
  fundingId: string().nullable(),
  contentSections: array(programContentSectionSchema).default([]),
  roles: array(programRoleSchema).default([]),
  plans: array(programPlanSchema).default([]),
  salePrice: number()
    .nullable()
    .default(0),
  listPrice: number()
    .nullable()
    .default(0),
  soldAt: date().nullable(),
  programCategories: array(programCategorySchema).default([]),
  isSoldOut: bool().nullable(),
}).camelCase()
