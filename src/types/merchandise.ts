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

export type ShippingProps = {
  name: string
  phone: string
  address: string
  shippingMethod: string
  specification: string
}

export type InvoiceProps = {
  name: string
  phone: string
  email: string
  phoneBarCode?: string
  citizenCode?: string
  uniformNumber?: string
  uniformTitle?: string
  donationCode?: string
  postCode?: string
  address?: string
}
