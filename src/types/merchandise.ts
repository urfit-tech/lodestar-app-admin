export type MerchandisePreviewProps = {
  id: string
  coverUrl: string | null
  title: string
  price: number
  publishedAt: Date | null
}

export type MerchandiseProps = {
  id: string
  title: string
  categories: {
    id: string
    name: string
  }[]
  tags: string[]
  images: {
    url: string
    isCover: boolean
  }[]
  abstract: string | null
  meta: string | null
  link: string | null
  description: string | null
  price: number
  publishedAt: Date | null
}

export type MerchandiseInventoryLog = {
  id: string
  createdAt: Date
  status: string
  specification: string
  quantity: number
}

export type MemberShopPreviewProps = {
  id: string
  name: string
  member: {
    id: string
    name: string
    pictureUrl: string | null
  }
  merchandisesCount: number
  publishedAt: Date | null
}
