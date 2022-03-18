export type CraftPageAdminProps = {
  id: string
  title: string | null
  path: string | null
  publishedAt: Date | null
  editorId: string | null
  craftData: { [key: string]: string } | null
  options: { customStyle?: string } | null
}

export type CraftPageColumnProps = {
  id: string
  title: string
  url: string
  updateAt: Date
}
