export type GiftPlan = {
  id: string
  title: string
  createdAt: string
  giftIdList: string[]
  giftPlanProductIdList: string[]
}

export type Gift = {
  id: string
  title: string
  coverUrl: string | null
  isDeliverable?: boolean
}

export type ProductGiftPlan = {
  productGiftPlanId: string,
  giftPlanId: string,
  giftPlanName?: string,
  startedAt: string,
  endedAt: string,
}
