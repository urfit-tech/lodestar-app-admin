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
  memberId: string
}

export type BlogPostProps = {
  post: PostType
  onRefetch?: () => void
}
