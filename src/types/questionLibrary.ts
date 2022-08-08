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