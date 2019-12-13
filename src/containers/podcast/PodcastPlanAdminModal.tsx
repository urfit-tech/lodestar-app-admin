import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { Dispatch, SetStateAction } from 'react'
import PodcastPlanAdminModalComponent from '../../components/podcast/PodcastPlanAdminModal'
import types from '../../types'

type PodcastPlanCreationModalProps = {
  isVisible: boolean
  onVisibleSet: Dispatch<SetStateAction<boolean>>
}

export type CreatePodcastPlanProps = (
  props: {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
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
    }
  }) => void

const PodcastPlanCreationModal: React.FC<PodcastPlanCreationModalProps> = ({ isVisible, onVisibleSet, children }) => {
  const [createPodcastPlan] = useMutation<types.CREATE_PODCAST_PLAN, types.CREATE_PODCAST_PLANVariables>(CREATE_PODCAST_PLAN)

  const handleCreate: CreatePodcastPlanProps = ({ onSuccess, onError, onFinally, data }) => {
    createPodcastPlan({
      variables: {
        isSubscription: true,
        publishedAt: data.isPublished ? new Date() : null,
        title: '',
        listPrice: data.listPrice,
        salePrice: data.salePrice,
        soldAt: data.soldAt,
        periodAmount: data.periodAmount,
        periodType: data.periodType,
        creatorId: data.creatorId
      }
    }).then(() => onSuccess && onSuccess())
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }
  return <PodcastPlanAdminModalComponent isVisible={isVisible} onVisibleSet={onVisibleSet}  onCreate={handleCreate} >
      {children}
    </ PodcastPlanAdminModalComponent>
}

const CREATE_PODCAST_PLAN = gql`
  mutation CREATE_PODCAST_PLAN(
    $isSubscription: Boolean!
    $publishedAt: timestamptz
    $title: String!
    $listPrice: numeric!
    $salePrice: numeric
    $soldAt: timestamptz
    $periodAmount: numeric!
    $periodType: String!
    $creatorId: String!
  ) {
    insert_podcast_plan(
      objects: {
        is_subscription: $isSubscription,
        published_at: $publishedAt,
        title: $title, 
        list_price: $listPrice,
        sale_price: $salePrice,
        sold_at: $soldAt,
        period_amount: $periodAmount,
        period_type: $periodType,
        creator_id: $creatorId
      }
    ) {
      affected_rows
    }
  }
`

export default PodcastPlanCreationModal
