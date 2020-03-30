export type MerchandiseProps = {
  id: string
  images: {
    url: string
    isCover: boolean
  }[]
  categories: {
    id: string
    name: string
  }[]
  tags: string[]
  title: string
  abstract: string | null
  price: number
  description: string | null
  link: string | null
}
