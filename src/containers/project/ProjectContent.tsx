import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { useAuth } from '../../components/auth/AuthContext'
import ProjectContentComponent from '../../components/project/ProjectContent'
import { useEnrolledProjectPlanIds } from '../../hooks/data'
import types from '../../types'

type ProjectContent = {
  projectId: string
}
const ProjectContent: React.FC<ProjectContent> = ({ projectId }) => {
  const { currentMemberId } = useAuth()
  const { enrolledProjectPlanIds } = useEnrolledProjectPlanIds(currentMemberId || '')
  const { loading, error, data } = useQuery<types.GET_PROJECT, types.GET_PROJECTVariables>(GET_PROJECT, {
    variables: { projectId },
  })

  const project =
    loading || error || !data || !data.project_by_pk
      ? {
          id: '',
          type: '',
          createdAt: new Date(),
          publishedAt: null,
          expiredAt: null,
          coverType: '',
          coverUrl: '',
          title: '',
          abstract: '',
          description: '',
          targetAmount: 0,
          template: null,
          introduction: '',
          contents: [],
          updates: [],
          comments: [],
          projectPlans: [],
        }
      : {
          id: data.project_by_pk.id,
          type: data.project_by_pk.type,
          createdAt: new Date(data.project_by_pk.created_at),
          publishedAt: data.project_by_pk.published_at ? new Date(data.project_by_pk.published_at) : null,
          expiredAt: data.project_by_pk.expired_at ? new Date(data.project_by_pk.expired_at) : null,
          coverType: data.project_by_pk.cover_type,
          coverUrl: data.project_by_pk.cover_url,
          title: data.project_by_pk.title,
          abstract: data.project_by_pk.abstract,
          description: data.project_by_pk.description,
          targetAmount: data.project_by_pk.target_amount,
          template: data.project_by_pk.template,
          introduction: data.project_by_pk.introduction,
          contents: data.project_by_pk.contents || [],
          updates: data.project_by_pk.updates || [],
          comments: data.project_by_pk.comments || [],

          projectPlans: data.project_by_pk.project_plans.map(projectPlans => ({
            id: projectPlans.id,
            coverUrl: projectPlans.cover_url,
            title: projectPlans.title,
            description: projectPlans.description,
            listPrice: projectPlans.list_price,
            salePrice: projectPlans.sale_price,
            soldAt: projectPlans.sold_at ? new Date(projectPlans.sold_at) : null,
            discountDownPrice: projectPlans.discount_down_price,
            createAt: new Date(projectPlans.created_at),
            isSubscription: projectPlans.is_subscription,
            periodAmount: projectPlans.period_amount,
            periodType: projectPlans.period_type,
            isExpired:
              data.project_by_pk && data.project_by_pk.expired_at
                ? new Date(data.project_by_pk.expired_at).getTime() < Date.now()
                : false,
            isEnrolled: enrolledProjectPlanIds.includes(projectPlans.id),
          })),
        }

  return <ProjectContentComponent loading={loading} error={error} {...project} />
}

const GET_PROJECT = gql`
  query GET_PROJECT($projectId: uuid!) {
    project_by_pk(id: $projectId) {
      id
      type
      created_at
      published_at
      expired_at
      cover_type
      cover_url
      title
      abstract
      description
      target_amount
      template
      introduction
      contents
      updates
      comments
      project_plans(order_by: { position: asc }) {
        id
        cover_url
        title
        description
        list_price
        sale_price
        sold_at
        discount_down_price
        created_at
        is_subscription
        period_amount
        period_type
      }
    }
  }
`

export default ProjectContent
