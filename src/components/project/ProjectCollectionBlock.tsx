import { useQuery } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectDataType, ProjectPreviewProps } from '../../types/project'
import { EmptyBlock } from '../admin'
import ProjectAdminCard from './ProjectAdminCard'

const ProjectCollectionBlock: React.FC<{
  appId: string
  condition: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']
  onReady?: (count: number) => void
}> = ({ appId, condition, onReady }) => {
  const { formatMessage } = useIntl()
  const { loadingProject, projectPreview, projectPreviewCount, refetchProject } = useProjectPreviewCollection(condition)

  useEffect(() => {
    onReady?.(projectPreviewCount)
    refetchProject()
  }, [onReady, projectPreviewCount, refetchProject])

  if (loadingProject) {
    return <Skeleton active />
  }

  if (projectPreview.length === 0) {
    return <EmptyBlock>{formatMessage(projectMessages.text.noProject)}</EmptyBlock>
  }

  return (
    <div className="row py-3">
      {projectPreview.map(project => (
        <div key={project.id} className="col-12 col-md-6 col-lg-4 mb-5">
          <ProjectAdminCard {...project} />
        </div>
      ))}
    </div>
  )
}

const useProjectPreviewCollection = (condition: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_PROJECT_PREVIEW_COLLECTION,
    types.GET_PROJECT_PREVIEW_COLLECTIONVariables
  >(GET_PROJECT_PREVIEW_COLLECTION, { variables: { condition, limit: 10 } })

  const projectPreview: ProjectPreviewProps[] =
    loading || error || !data
      ? []
      : data.project.map(v => {
          return {
            id: v.id,
            title: v.title,
            abstract: v.abstract,
            projectType: v.type as ProjectDataType,
            createdAt: v.created_at,
            publishedAt: v.published_at,
            expiredAt: v.expired_at,
            coverUrl: v.cover_url,
            previewUrl: v.preview_url,
            totalCount: sum(v.project_plans.map(w => w.project_plan_enrollments_aggregate.aggregate?.count || 0)),
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
    projectPreviewCount: data?.project_aggregate.aggregate?.count || 0,
    projectPreview,
    refetchProject: refetch,
    loadMoreProjects,
  }
}

const GET_PROJECT_PREVIEW_COLLECTION = gql`
  query GET_PROJECT_PREVIEW_COLLECTION($condition: project_bool_exp!, $limit: Int!) {
    project_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    project(where: $condition, order_by: [{ created_at: desc_nulls_last }], limit: $limit) {
      id
      title
      abstract
      type
      created_at
      published_at
      expired_at
      cover_url
      preview_url
      creator_id
      project_plans {
        id
        project_plan_enrollments_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`
export default ProjectCollectionBlock
