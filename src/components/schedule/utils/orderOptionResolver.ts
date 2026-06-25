const pickString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return null
}

export const resolveOrderCampusId = (orderOptions?: any, productMeta?: any): string | null => {
  const orderNestedOptions = orderOptions?.options || {}
  const productNestedOptions = productMeta?.options || {}

  return pickString(
    orderOptions?.campus_id,
    orderOptions?.campusId,
    orderOptions?.permission_group_id,
    orderOptions?.permissionGroupId,
    orderOptions?.campus?.id,
    orderOptions?.permission_group?.id,
    orderNestedOptions?.campus_id,
    orderNestedOptions?.campusId,
    orderNestedOptions?.permission_group_id,
    orderNestedOptions?.permissionGroupId,
    productMeta?.campus_id,
    productMeta?.campusId,
    productMeta?.permission_group_id,
    productMeta?.permissionGroupId,
    productMeta?.campus?.id,
    productMeta?.permission_group?.id,
    productNestedOptions?.campus_id,
    productNestedOptions?.campusId,
    productNestedOptions?.permission_group_id,
    productNestedOptions?.permissionGroupId,
  )
}
