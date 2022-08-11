export type QuestionLibrary = {
  id: string
  app_id: string
  title: string
  abstract?: string | null
  modifier: {
    id: string
    name: string
  }
  updatedAt: Date
}

export type Question = {
  id: string
  type: string
  subject: string
  layout: string
  font: string
  position: number
  explanation: string | null
  options?: QuestionOption[]
}

export type QuestionOption = {
  id: string
  value: string
  isAnswer: boolean
  position: number
}
