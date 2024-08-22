import { ProductInventoryStatusProps } from './general'

export type MerchandisePreviewProps = {
  id: string
  coverUrl: string | null
  title: string
  soldAt: Date | null
  maxPrice: number | null
  minPrice: number | null
  publishedAt: Date | null
  isPhysical: boolean
  isCustomized: boolean
  currencyId: string
  soldQuantity?: number
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
  link: string | null
  description: string | null
  soldAt: Date | null
  startedAt: Date | null
  endedAt: Date | null
  publishedAt: Date | null
  memberShopId: string | null
  isPhysical: boolean
  isCustomized: boolean
  isLimited: boolean
  isCountdownTimerVisible: boolean
  currencyId: string
  specs: MerchandiseSpecProps[]
}

export type MerchandiseSpecProps = {
  id: string
  title: string
  listPrice: number
  salePrice: number | null
  quota: number
  files: { id: string; data: any }[]
  coinBack: number | null
  coinBackPeriodAmount: number | null
  coinBackPeriodType: string | null
}

export type MerchandiseSpec = {
  id: string
  title: string
  coverUrl: string | null
  publishedAt: Date | null
  inventoryStatus: ProductInventoryStatusProps
  isPhysical: boolean
  isCustomized: boolean
  merchandiseTitle: string
  memberShop: {
    id: string
    title: string
  }
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

export type ShippingMethodType =
  | 'seven-eleven'
  | 'family-mart'
  | 'hi-life'
  | 'ok-mart'
  | 'home-delivery'
  | 'send-by-post'
  | 'other'
export type ShippingMethodProps = {
  id: ShippingMethodType
  enabled: boolean
  fee: number
  days: number
}

export type MemberShopProps = {
  id: string
  title: string
  shippingMethods: ShippingMethodProps[]
  publishedAt: Date | null
  coverUrl: string | null
  member: {
    id: string
    name: string
    pictureUrl: string | null
  }
}

export type ShippingProps = {
  name: string
  phone: string
  zipCode?: string
  address: string
  shippingMethod: string
  specification: string
  storeName?: string
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
  status?: string
  invoiceNumber?: string
  referrerEmail?: string
  invoiceComment?: string
}
