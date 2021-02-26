import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'

export const useOrderStatuses = () => {
  const { loading, error, data } = useQuery<types.GET_ORDER_LOG_STATUS>(gql`
    query GET_ORDER_LOG_STATUS {
      order_log(distinct_on: status) {
        status
      }
    }
  `)

  return {
    loading,
    error,
    data:
      data?.order_log?.reduce(
        (accumulator, value) =>
          value.status && !accumulator.includes(value.status) ? [...accumulator, value.status] : accumulator,
        [] as string[],
      ) || [],
  }
}
