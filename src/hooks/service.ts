import { gql, useApolloClient, useQuery } from '@apollo/client'
import hasura from '../hasura'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { Service } from '../types/service'
import { useState } from 'react'
import { handleError } from '../helpers'
import { useGetOverlapMeet } from './meet'

export const GetService = gql`
  query GetService($appId: String!) {
    service(where: { app_id: { _eq: $appId } }) {
      id
      gateway
    }
  }
`

export const useMeetingServiceCheck = () => {
  const apolloClient = useApolloClient()
  const { id: appId } = useApp()
  const { getOverlapMeets } = useGetOverlapMeet()
  const [invalidGateways, setInvalidGateways] = useState<string[]>([])

  const getAvailableGatewayServiceId = async ({
    gateway,
    startedAt,
    endedAt,
  }: {
    gateway: string
    startedAt: Date
    endedAt: Date
  }) => {
    const { overlapMeets } = await getOverlapMeets({
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
    })
    const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
      query: GetService,
      variables: {
        appId,
      },
    })
    const gatewayServices = serviceData.service.filter(service => service.gateway === gateway)

    if (gatewayServices.length === 0) {
      setInvalidGateways(prev => [...prev.filter(v => v !== gateway), gateway])
      return handleError({ message: `無 ${gateway} 帳號` })
    }
    const gatewayServiceIds = gatewayServices.map(service => service.id)
    const periodUsedServiceId = overlapMeets.map(meet => meet.serviceId)
    const availableGatewayServiceId = gatewayServiceIds.find(serviceId => !periodUsedServiceId.includes(serviceId))
    // FIXME:因應業務需求, 先跳過 google meet 的指派執行人員檢查
    if (gateway !== 'google-meet') {
      if (!availableGatewayServiceId) {
        setInvalidGateways(prev => [...prev.filter(v => v !== gateway), gateway])
        return handleError({ message: `此時段無可用 ${gateway} 帳號` })
      } else {
        setInvalidGateways(prev => [...prev.filter(v => v !== gateway)])
      }
    }
    return availableGatewayServiceId
  }

  const getValidGatewaysWithinTimeRange = async ({ startedAt, endedAt }: { startedAt: Date; endedAt: Date }) => {
    const { overlapMeets } = await getOverlapMeets({
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
    })
    const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
      query: GetService,
      variables: {
        appId,
      },
    })
    const availableGatewayServices = serviceData.service.filter(
      service => !overlapMeets.find(overlapMeet => overlapMeet.serviceId === service.id),
    )
    return Array.from(new Set(availableGatewayServices.map(service => service.gateway)))
  }

  return { getAvailableGatewayServiceId, getValidGatewaysWithinTimeRange, invalidGateways, setInvalidGateways }
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
