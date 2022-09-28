export type ProductGiftPlan = {
  id: string
  giftPlan: GiftPlan
  startedAt: string
  endedAt: string
}

export type GiftPlan = {
  id: string
  title?: string
  gift: Gift
}

export type Gift = {
  id: string
  title?: string
  coverUrl?: string | null
  price?: number
  currencyId?: string
  isDeliverable?: boolean
}

export type GiftPlanCollectionProps = Pick<GiftPlan, 'id' | 'title'> & {
  createdAt: string
  giftIdList: string[]
  giftPlanProductIdList: string[]
}
