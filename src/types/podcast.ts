import { CategoryProps, PeriodType } from './general'

export type PodcastProgramAdminProps = {
  id: string
  title: string
  contentType: string | null
  duration: number
  description: string | null
  coverUrl: string | null
  abstract: string | null
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  creatorId: string
  instructors: { id: string; name: string; pictureUrl: string }[]
  publishedAt: Date | null
  supportLocales: string[]
}

export type PodcastProgramAdminProps = PodcastProgramProps & {
  categories: PodcastProgramCategoryProps[]
  tags: string[]
}

export type PodcastPlanProps = {
  id: string
  isSubscription: boolean
  title: string
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  publishedAt: Date | null
  periodAmount: number
  periodType: PeriodType
  creatorId: string
}

export type PodcastProgramCategoryProps = {
  id: string
  category: CategoryProps
}
