/**
 * 取得主要方案（按 position → created_at 排序的第一個）
 * @param plans - 已按 position, created_at 排序的方案列表
 * @returns 選中的方案
 */
export const selectPrimaryPlan = <T>(plans: T[] | undefined | null): T | undefined => {
  if (!plans || plans.length === 0) return undefined
  return plans[0]
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
