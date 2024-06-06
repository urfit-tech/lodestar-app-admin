import { ApolloClient, QueryOptions } from '@apollo/client'
import { useEffect, useRef } from 'react'

export const useInterval = (callback: Function, delay: number | null, immediately?: boolean) => {
  const savedCallback = useRef<Function>()

  // 保存新回调
  useEffect(() => {
    savedCallback.current = callback
  })

  // 建立 interval
  useEffect(() => {
    const tick = () => {
      savedCallback.current && savedCallback.current()
    }
    if (delay !== null) {
      immediately && tick()
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, immediately])
}

type ErrorHandler = (error: any) => void

export async function executeQuery(
  queryClient: ApolloClient<object>,
  options: QueryOptions,
  onError?: ErrorHandler,
): Promise<any> {
  try {
    const response = await queryClient.query({
      query: options.query,
      variables: options.variables,
    })
    return response.data
  } catch (error) {
    console.error('Error executing query:', error)
    if (onError) {
      onError(error)
    }
    return null
  }
}
