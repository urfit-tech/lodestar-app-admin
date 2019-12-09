import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import PodcastPlanAdminModalComponent from '../../components/podcast/PodcastPlanAdminModal'
import types from '../../types'

type PodcastPlanCreationModalProps = {}

export type CreatePodcastPlanProps = (
  props: {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
    onFinally?: () => void
    data: {
      isSubscription: boolean
      title: string
      listPrice: number
      periodAmount: number
      periodType: string
      creatorId: string
    }
  }) => void

const PodcastPlanCreationModal: React.FC<PodcastPlanCreationModalProps> = ({ }) => {
  const [createPodcastPlan] = useMutation<types.CREATE_PODCAST_PLAN, types.CREATE_PODCAST_PLANVariables>(CREATE_PODCAST_PLAN)

  const handleCreate: CreatePodcastPlanProps = ({ onSuccess, onError, onFinally, data }) => {
    createPodcastPlan({
      variables: {
        isSubscription: true,
        title: '',
        listPrice: 1,
        periodAmount: '',
        periodType: '',
        creatorId: ''
      }
    })
      .then()
      .catch()
      .finally()
  }
  return <PodcastPlanAdminModalComponent onCreate={handleCreate} />
}

const CREATE_PODCAST_PLAN = gql`
  mutation CREATE_PODCAST_PLAN(
    $isSubscription: Boolean!
    $title: String!
    $listPrice: numeric!
    $periodAmount: numeric!
    $periodType: String!
    $creatorId: String!
  ) {
    insert_podcast_plan(
      objects: {
        is_subscription: $isSubscription, 
        title: $title, 
        list_price: $listPrice,
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
