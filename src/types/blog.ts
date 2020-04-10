export type PostType = {
  id: string
  title: string
  videoUrl: string | null
  description: string | null
  categories: {
    id: string
    name: string
  }[]
  tagNames: string[]
  isDeleted: boolean
  codeName: string
  codeNames?: (string | null)[]
  coverUrl: string | null
  merchandiseIds?: string[]
  creatorId: string
  authors?: Array<{
    id: string
    name: string
    pictureUrl: string | null
  }>
}

export type BlogPostProps = {
  post: PostType
  onRefetch?: () => void
}
