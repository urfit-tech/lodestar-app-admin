export type ProjectProps = {
  id: string
  title: string
  abstract: string | null
  introduction: string | null
  description: string | null
  targetAmount: number
  targetUnit: string
  type: string
  updates: string
  createdAt: Date | null
  publishedAt: Date | null
  expiredAt: Date | null
  comments: string
  contents: string
  coverType: string
  coverUrl: string
  previewUrl: string | null
  isParticipantsVisible: boolean
  isCountdownTimerVisible: boolean
}
