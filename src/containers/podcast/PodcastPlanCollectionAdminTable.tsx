import { Skeleton } from 'antd'
import { ApolloError, ApolloQueryResult } from 'apollo-client'
import React from 'react'
import PodcastPlanCollectionAdminTableComponent from '../../components/podcast/PodcastPlanCollectionAdminTable'
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
  if (loading) {
    return <Skeleton />
  }

  if (error || !podcastPlans) {
    return <div>讀取錯誤</div>
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
