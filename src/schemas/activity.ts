import { array, boolean, date, number, object, string } from 'yup'

const categorySchema = object({
  id: string(),
  name: string(),
  class: string(),
  position: number(),
}).camelCase()

const activityCategorySchema = object({
  id: string(),
  category: categorySchema,
  position: number(),
}).camelCase()

const activitySessionSchema = object({
  id: string(),
  title: string(),
  description: string().nullable(),
  threshold: number().nullable(),
  startedAt: date(),
  endedAt: date(),
  location: string(),
  activityId: string(),
}).camelCase()

const activitySessionTicketSchema = object({
  id: string(),
  session: activitySessionSchema,
})
  .camelCase()
  .from('activitySession', 'session')

export const activityTicketSchema = object({
  id: string(),
  startedAt: date(),
  endedAt: date(),
  price: number(),
  count: number(),
  description: string().nullable(),
  isPublished: boolean(),
  title: string(),
  activityId: string(),

  sessionTickets: array(activitySessionTicketSchema).default([]),
})
  .camelCase()
  .from('activitySessionTickets', 'sessionTickets')

export const activitySchema = object({
  id: string(),
  title: string(),
  description: string(),
  isParticipantsVisible: boolean().default(false),
  coverUrl: string().nullable(),
  organizerId: string(),
  appId: string(),

  categories: array(activityCategorySchema).default([]),
  sessions: array(activitySessionSchema).default([]),
  tickets: array(activityTicketSchema).default([]),
})
  .camelCase()
  .from('activityCategories', 'categories')
  .from('activitySessions', 'sessions')
  .from('activityTickets', 'tickets')
