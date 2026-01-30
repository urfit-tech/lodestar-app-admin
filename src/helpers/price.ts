type PlanWithPrice = {
  sale_price?: number | null
  sold_at?: string | null
  list_price?: number | null
}

/**
 * 優先順序：有效特價方案 > 排序第一個方案
 * @param plans - 已按 position, created_at 排序的方案列表
 * @returns 選中的方案
 */
export const selectPrimaryPlan = <T extends PlanWithPrice>(plans: T[] | undefined | null): T | undefined => {
  if (!plans || plans.length === 0) return undefined

  const now = Date.now()
  // 優先找有有效特價的方案（sale_price 可以是 0，所以用 !== null 檢查）
  const planWithSale = plans.find(
    p => p.sale_price !== null && p.sale_price !== undefined && p.sold_at && new Date(p.sold_at).getTime() > now,
  )
  // 如果沒有有效特價，取排序第一個（已按 position → created_at 排序）
  return planWithSale || plans[0]
}

/**
 * 取得有效的特價金額
 * 只有在 sale_price 存在且 sold_at 尚未過期時才返回特價
 */
export const getValidSalePrice = (
  salePrice: number | null | undefined,
  soldAt: string | Date | null | undefined,
): number | null => {
  if (salePrice === null || salePrice === undefined) return null
  if (!soldAt) return null

  const soldAtTime = soldAt instanceof Date ? soldAt.getTime() : new Date(soldAt).getTime()
  if (soldAtTime <= Date.now()) return null

  return salePrice
}
