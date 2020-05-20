import { useMutation } from '@apollo/react-hooks'
import { ApolloQueryResult } from 'apollo-client'
import gql from 'graphql-tag'
import React, { Dispatch, SetStateAction } from 'react'
import PodcastPlanAdminModal from '../../components/podcast/PodcastPlanAdminModal'
import { usePodcastPlan } from '../../hooks/podcast'
import types from '../../types'

type PodcastPlanUpdateModalProps = {
  isVisible: boolean
  onVisibleSet: Dispatch<SetStateAction<boolean>>
  podcastPlanId: string
  refetch: (
    variables?: Record<string, any> | undefined,
  ) => Promise<ApolloQueryResult<types.GET_PODCAST_PLAN_ADMIN_COLLECTION>>
}
const PodcastPlanUpdateModal: React.FC<PodcastPlanUpdateModalProps> = ({
  isVisible,
  onVisibleSet,
  podcastPlanId,
  refetch,
}) => {
  const [updatePodcastPlan] = useMutation<types.UPDATE_PODCAST_PLAN, types.UPDATE_PODCAST_PLANVariables>(
    UPDATE_PODCAST_PLAN,
  )

  const handleUpdate: (props: {
    onSuccess?: () => void
    onError?: (error: Error) => void
    onFinally?: () => void
    data: {
      title: string
      isPublished: boolean
      isSubscription: boolean
      listPrice: number
      salePrice: number
      soldAt: Date | null
      periodAmount: number
      periodType: string
      creatorId: string
      podcastPlanId?: string
    }
  }) => void = ({ onSuccess, onError, onFinally, data }) => {
    updatePodcastPlan({
      variables: {
        podcastPlanId: podcastPlanId,
        listPrice: data.listPrice,
        periodAmount: data.periodAmount,
        periodType: data.periodType,
        publishedAt: data.isPublished ? new Date() : null,
        salePrice: data.salePrice || 0,
        soldAt: data.soldAt,
        creatorId: data.creatorId,
      },
    })
      .then(() => {
        refetch()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  const { loadingPodcastPlan, podcastPlan } = usePodcastPlan(podcastPlanId)

  if (loadingPodcastPlan) {
    return null
  }

  return (
    <PodcastPlanAdminModal
      podcastPlan={podcastPlan}
      isVisible={isVisible}
      onVisibleSet={onVisibleSet}
      onSubmit={handleUpdate}
    />
  )
}

const UPDATE_PODCAST_PLAN = gql`
  mutation UPDATE_PODCAST_PLAN(
    $podcastPlanId: uuid!
    $listPrice: numeric!
    $periodAmount: numeric!
    $periodType: String!
    $publishedAt: timestamptz
    $salePrice: numeric!
    $soldAt: timestamptz
    $creatorId: String!
  ) {
    update_podcast_plan(
      where: { id: { _eq: $podcastPlanId } }
      _set: {
        list_price: $listPrice
        period_amount: $periodAmount
        period_type: $periodType
        published_at: $publishedAt
        sale_price: $salePrice
        sold_at: $soldAt
        creator_id: $creatorId
      }
    ) {
      affected_rows
    }
  }
`

export default PodcastPlanUpdateModal
