import { Skeleton } from 'antd'
import { ApolloError, ApolloQueryResult } from 'apollo-client'
import React from 'react'
import { useIntl } from 'react-intl'
import PodcastPlanCollectionAdminTableComponent from '../../components/podcast/PodcastPlanCollectionAdminTable'
import { errorMessages } from '../../helpers/translation'
import { PodcastPlan } from '../../hooks/podcast'
import types from '../../types'

type PodcastPlanCollectionAdminTableProps = {
  loading: boolean
  error?: ApolloError
  podcastPlans: PodcastPlan[] | null
  refetch: (
    variables?: Record<string, any> | undefined,
  ) => Promise<ApolloQueryResult<types.GET_PODCAST_PLAN_ADMIN_COLLECTION>>
}

const PodcastPlanCollectionAdminTable: React.FC<PodcastPlanCollectionAdminTableProps> = ({
  loading,
  error,
  podcastPlans,
  refetch,
}) => {
  const { formatMessage } = useIntl()

  if (loading) {
    return <Skeleton />
  }

  if (error || !podcastPlans) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  return (
    <>
      <PodcastPlanCollectionAdminTableComponent
        loading={loading}
        error={error}
        podcastPlans={podcastPlans}
        refetch={refetch}
      />
    </>
  )
}

export default PodcastPlanCollectionAdminTable
