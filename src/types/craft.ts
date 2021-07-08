export type CraftPageAdminProps = {
  id: string
  pageName: string
  path: string
  publishedAt: Date | null
}

export type CraftPageColumnProps = {
  id: string
  pageName: string
  url: string
  updateAt: Date
}

export type CraftTextStyleProps = {
  fontSize: number
  lineHeight?: number
  padding: number
  textAlign: 'left' | 'right' | 'center'
  fontWeight: 'lighter' | 'normal' | 'bold'
  color: string
}

export type CraftTitleProps = {
  titleContent: string
} & CraftTextStyleProps

export type CraftParagraphProps = {
  paragraphContent: string
} & CraftTextStyleProps

export type CraftButtonProps = {
  title: string
  link: string
  openNewTab: boolean
  size: 'sm' | 'md' | 'lg'
  block: boolean
  variant: 'text' | 'solid' | 'outline'
  color: string
}
