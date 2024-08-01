import { gql, useApolloClient, useQuery } from '@apollo/client'
import hasura from '../hasura'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { Service } from '../types/service'
import { useState } from 'react'
import { handleError } from '../helpers'
import { OverlapMeets } from '../types/meet'
import { MeetingGateway } from '../types/member'

export const GetService = gql`
  query GetService($appId: String!, $gateway: String!) {
    service(where: { app_id: { _eq: $appId }, gateway: { _eq: $gateway } }) {
      id
      gateway
    }
  }
`

export const GetAllService = gql`
  query GetAllService($appId: String!) {
    service(where: { app_id: { _eq: $appId } }) {
      id
      gateway
    }
  }
`

export const useServiceCheck = () => {
  const apolloClient = useApolloClient()
  const { id: appId } = useApp()
  const [invalidGateways, setInvalidGateways] = useState<string[]>([])

  const serviceCheck = async (overlapMeets: OverlapMeets, gateway: MeetingGateway) => {
    const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
      query: GetService,
      variables: {
        appId,
        gateway,
      },
    })
    const services = serviceData.service.filter(service => service.gateway === gateway)

    if (services.length === 0) {
      setInvalidGateways(prev => [...prev.filter(v => v !== gateway), gateway])
      return handleError({ message: `無${gateway}帳號` })
    }
    const serviceIds = services.map(service => service.id)
    const periodUsedServiceId = overlapMeets.map(meet => meet.serviceId)
    const availableServiceId = serviceIds.find(serviceId => !periodUsedServiceId.includes(serviceId))
    if (!availableServiceId) {
      setInvalidGateways(prev => [...prev.filter(v => v !== gateway), gateway])
      return handleError({ message: `此時段無可用${gateway}帳號` })
    } else {
      setInvalidGateways(prev => [...prev.filter(v => v !== gateway)])
    }
    return availableServiceId
  }

  return { serviceCheck, invalidGateways, setInvalidGateways }
}

export const useService = () => {
  const { id: appId } = useApp()
  const { loading, data } = useQuery<hasura.GetAllService, hasura.GetAllServiceVariables>(GetAllService, {
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
