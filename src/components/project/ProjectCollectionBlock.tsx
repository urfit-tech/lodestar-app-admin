import { useQuery } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectProps } from '../../types/project'
import { EmptyBlock } from '../admin'

const ProjectCollectionBlock: React.FC<{
  appId: string
  condition: types.GET_PROJECT_COLLECTIONVariables['condition']
  onReady?: (count: number) => void
}> = ({ appId, condition, onReady }) => {
  const { formatMessage } = useIntl()
  const {
    loadingProject,
    errorProject,
    project,
    projectCount,
    refetchProject,
    loadMoreProjects,
  } = useProjectCollection(condition)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onReady?.(projectCount)
    refetchProject()
  }, [onReady, projectCount, refetchProject])

  if (loadingProject) {
    return <Skeleton active />
  }

  if (project.length === 0) {
    return <EmptyBlock>{formatMessage(projectMessages.text.noProject)}</EmptyBlock>
  }

  return (
    <div className="row py-3">
      {project.map(v => (
        <div key={v.id} className="col-12 col-md-6 col-lg-4 mb-5">
          {/* <ProjectCard /> */}
        </div>
      ))}
    </div>
  )
}

const useProjectCollection = (condition: types.GET_PROJECT_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_PROJECT_COLLECTION,
    types.GET_PROJECT_COLLECTIONVariables
  >(GET_PROJECT_COLLECTION, { variables: { condition, limit: 10 } })

  const project: ProjectProps[] =
    loading || error || !data
      ? []
      : data.project.map(v => {
          return {
            id: v.id,
            title: v.title,
            abstract: v.abstract,
            introduction: v.introduction,
            description: v.description,
            position: v.position,
            targetAmount: v.target_amount,
            targetUnit: v.target_unit,
            type: v.type,
            updates: v.updates,
            createdAt: v.created_at,
            publishedAt: v.published_at,
            expiredAt: v.expired_at,
            comments: v.comments,
            contents: v.contents,
            coverType: v.cover_type,
            coverUrl: v.cover_url,
            previewUrl: v.preview_url,
            isParticipantsVisible: v.is_participants_visible,
            isCountdownTimerVisible: v.is_countdown_timer_visible,
          }
        })
  const loadMoreProjects =
    (data?.project.length || 0) < (data?.project_aggregate.aggregate?.count || 0)
      ? () =>
          fetchMore({
            variables: {
              condition: {
                ...condition,
                created_at: { _lt: data?.project.slice(-1)[0]?.created_at },
              },
              limit: 10,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                project_aggregate: prev.project_aggregate,
                project: [...prev.project, ...fetchMoreResult.project],
              }
            },
          })
      : undefined
  return {
    loadingProject: loading,
    errorProject: error,
    projectCount: data?.project_aggregate.aggregate?.count || 0,
    project,
    refetchProject: refetch,
    loadMoreProjects,
  }
}
const GET_PROJECT_COLLECTION = gql`
  query GET_PROJECT_COLLECTION($condition: project_bool_exp!, $limit: Int!) {
    project_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    project(where: $condition, order_by: [{ created_at: desc_nulls_last }], limit: $limit) {
      id
      title
      abstract
      introduction
      description
      position
      published_at
      target_amount
      target_unit
      type
      updates
      created_at
      published_at
      expired_at
      comments
      contents
      cover_type
      cover_url
      is_participants_visible
      is_countdown_timer_visible
      preview_url
      creator {
        id
        name
        username
        picture_url
      }
      project_plans {
        id
      }
    }
  }
`
export default ProjectCollectionBlock
