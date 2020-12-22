import { CategoryProps } from './general'

export type ProjectDataType = 'funding' | 'pre-order' | 'on-sale' | 'modular'

export type ProjectAdminProps = {
  id: string
  title: string
  abstract: string | null
  categories: CategoryProps[]
  introduction: string | null
  description: string | null
  targetAmount: number
  targetUnit: string
  projectType: ProjectDataType
  updates: string | null
  createdAt: Date | null
  publishedAt: Date | null
  expiredAt: Date | null
  comments: string | null
  contents: string | null
  coverType: string | null
  coverUrl: string | null
  previewUrl: string | null
  isParticipantsVisible: boolean
  isCountdownTimerVisible: boolean
}

export type ProjectPreviewProps = {
  id: string
  title: string
  abstract: string | null
  projectType: ProjectDataType
  createdAt: Date | null
  publishedAt: Date | null
  expiredAt: Date | null
  coverUrl: string | null
  previewUrl: string | null
  totalCount: number
}
