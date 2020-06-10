export type MerchandisePreviewProps = {
  id: string
  coverUrl: string | null
  title: string
  listPrice: number
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
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  startedAt: Date | null
  endedAt: Date | null
  publishedAt: Date | null
}

export type MemberShopPreviewProps = {
  id: string
  title: string
  member: {
    id: string
    name: string
    pictureUrl: string | null
  }
  merchandisesCount: number
  publishedAt: Date | null
}

export type ShippingMethod = 'sevenEleven' | 'familyMart' | 'hiLife' | 'okMart' | 'homeDelivery'
export const ShippingMethodIds: ShippingMethod[] = ['sevenEleven', 'familyMart', 'hiLife', 'okMart', 'homeDelivery']
export type ShippingMethodProps = {
  id: ShippingMethod
  enabled: boolean
  fee: number
  days: number
}

export type MemberShopProps = {
  id: string
  title: string
  shippingMethods: ShippingMethodProps[]
  publishedAt: Date | null
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
