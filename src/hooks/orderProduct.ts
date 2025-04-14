import { gql, useMutation } from '@apollo/client'
import hasura from '../hasura'

export const useMutateOrderProduct = () => {
  const [deliverOrderProductForOrder] = useMutation<
    hasura.deliverOrderProductForOrder,
    hasura.deliverOrderProductForOrderVariables
  >(
    gql`
      mutation deliverOrderProductForOrder($orderId: String!) {
        update_order_product(where: { order_id: { _eq: $orderId } }, _set: { delivered_at: "now()" }) {
          affected_rows
        }
      }
    `,
  )
  return {
    deliverOrderProductForOrder,
  }
}
