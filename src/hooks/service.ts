import { gql, useApolloClient, useQuery } from '@apollo/client'
import hasura from '../hasura'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { Service } from '../types/service'
import { useState } from 'react'
import { handleError } from '../helpers'
import { OverlapMeets } from '../types/meet'

export const GetService = gql`
  query GetService($appId: String!) {
    service(where: { app_id: { _eq: $appId } }) {
      id
      gateway
    }
  }
`

export const useZoomServiceCheck = () => {
  const apolloClient = useApolloClient()
  const { id: appId } = useApp()
  const [invalidGateways, setInvalidGateways] = useState<string[]>([])

  const zoomServiceCheck = async ({ overlapMeets }: { overlapMeets: OverlapMeets }) => {
    const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
      query: GetService,
      variables: {
        appId,
      },
    })
    const zoomServices = serviceData.service.filter(service => service.gateway === 'zoom')

    if (zoomServices.length === 0) {
      setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom'), 'zoom'])
      return handleError({ message: '無zoom帳號' })
    }
    const zoomServiceIds = zoomServices.map(service => service.id)
    const periodUsedServiceId = overlapMeets.map(meet => meet.serviceId)
    const availableZoomServiceId = zoomServiceIds.find(serviceId => !periodUsedServiceId.includes(serviceId))
    if (!availableZoomServiceId) {
      setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom'), 'zoom'])
      return handleError({ message: '此時段無可用zoom帳號' })
    } else {
      setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom')])
    }
    return availableZoomServiceId
  }
  return { zoomServiceCheck, invalidGateways, setInvalidGateways }
}

export const useService = () => {
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
