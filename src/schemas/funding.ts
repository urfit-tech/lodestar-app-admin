import { array, date, number, object, string } from 'yup'
import { programSchema } from './program'

export const fundingSchema = object({
  id: string(),
  appId: string(),
  coverType: string(),
  coverUrl: string(),
  title: string(),
  subtitle: string(),
  description: string(),
  targetAmount: number(),
  introduction: string(),
  updates: array(
    object({
      date: string(),
      title: string(),
      description: string(),
      cover: string().nullable(),
    }),
  ).default([]),
  comments: array(
    object({
      name: string(),
      title: string(),
      avatar: string(),
      description: string(),
    }),
  ).default([]),
  contents: array(
    object({
      title: string(),
      subtitle: string(),
      contents: array(
        object({
          title: string(),
          description: string(),
        }),
      ),
    }),
  ).default([]),
  expiredAt: date().nullable(),
  type: string(),
  programs: array(programSchema.from('programPlans', 'plans')).default([]),
}).camelCase()
