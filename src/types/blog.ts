export type PostType = {
  id: string
  title: string
  videoUrl: string | null
  description: string | null
}

export type BlogPostProps = {
  post: PostType
  onRefetch?: () => void
}