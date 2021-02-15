import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'

export const useOrderStatuses = () => {
  const { loading, error, data } = useQuery<types.GET_ORDER_STATUS>(gql`
    query GET_ORDER_STATUS {
      order_status(distinct_on: status) {
        status
      }
    }
  `)

  return {
    loading,
    error,
    data: data?.order_status?.map(v => v.status || 'UNKNOWN') || [],
  }
}
