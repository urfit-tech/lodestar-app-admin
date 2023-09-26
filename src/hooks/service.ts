import { gql, useQuery } from '@apollo/client'
import hasura from '../hasura'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { Service } from '../types/service'

export const GetService = gql`
  query GetService($appId: String!) {
    service(where: { app_id: { _eq: $appId } }) {
      id
      gateway
    }
  }
`

export const UseService = () => {
  const { id: appId } = useApp()
  const { loading, data } = useQuery<hasura.GetService, hasura.GetServiceVariables>(GetService, {
    variables: { appId },
  })
  const services: Service[] =
    data?.service.map(v => ({
      id: v.id,
      gateway: v.gateway,
    })) || []

  return {
    loading,
    services,
  }
}
