import { MetaTag } from "./general"

export type PostProps = {
  id: string
  title: string
  source: string | null
  videoUrl: string | null
  description: string | null
  categories: {
    id: string
    name: string
  }[]
  tagNames: string[]
  isDeleted: boolean
  codeName: string | null
  codeNames: (string | null)[]
  coverUrl: string | null
  merchandiseIds?: string[]
  creatorId: string
  authors?: {
    id: string
    name: string
    pictureUrl: string | null
  }[]
  publishedAt: Date | null
  metaTag: MetaTag
}
