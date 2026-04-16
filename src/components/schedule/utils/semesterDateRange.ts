import moment, { Moment } from 'moment'

type OrderLike = { createdAt: Date }

export const computeSemesterMaxEndDate = (orders: OrderLike[]): Moment | null => {
  if (orders.length === 0) return null
  const earliest = orders.reduce(
    (acc, order) => (moment(order.createdAt).isBefore(acc) ? moment(order.createdAt) : acc),
    moment(orders[0].createdAt),
  )
  return earliest.clone().add(180, 'day')
}
