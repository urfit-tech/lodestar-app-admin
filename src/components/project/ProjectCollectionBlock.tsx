import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Skeleton } from 'antd'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectDataType, ProjectPreviewProps, ProjectSortProps } from '../../types/project'
import { EmptyBlock } from '../admin'
import ItemsSortingModal from '../common/ItemsSortingModal'
import ProjectAdminCard from './ProjectAdminCard'

const ProjectCollectionBlock: React.FC<{
  appId: string
  projectType: ProjectDataType
  condition: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']
  orderBy?: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['orderBy']
  withSortingButton?: boolean
  onReady?: (count: number) => void
}> = ({ appId, projectType, condition, orderBy, withSortingButton, onReady }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const {
    loadingProject,
    projectPreview,
    projectPreviewCount,
    refetchProject,
    loadMoreProjects,
  } = useProjectPreviewCollection(condition, orderBy)

  const { projectSorts, refetchProjectSorts } = useProjectSortCollection(condition)
  const [updatePositions] = useMutation<
    types.UPDATE_PROJECT_POSITION_COLLECTION,
    types.UPDATE_PROJECT_POSITION_COLLECTIONVariables
  >(UPDATE_PROJECT_POSITION_COLLECTION)

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
    <>
      <div className="row py-3">
        {withSortingButton && (
          <div className="col-12 text-right">
            <ItemsSortingModal
              items={projectSorts}
              triggerText={formatMessage(projectMessages.ui.sortProject)}
              onSubmit={values =>
                updatePositions({
                  variables: {
                    data: values.map((value, index) => ({
                      id: value.id,
                      title: value.title,
                      type: projectType,
                      position: index,
                      app_id: appId,
                    })),
                  },
                })
                  .then(() => {
                    refetchProjectSorts()
                    refetchProject()
                  })
                  .catch(handleError)
              }
            />
          </div>
        )}
        {projectPreview.map(project => (
          <div key={project.id} className="col-12 col-md-6 col-lg-4 mb-5">
            <ProjectAdminCard {...project} />
          </div>
        ))}
        {loadMoreProjects && (
          <div className="text-center" style={{ width: '100%' }}>
            <Button
              loading={loading}
              onClick={() => {
                setLoading(true)
                loadMoreProjects()?.finally(() => setLoading(false))
              }}
            >
              {formatMessage(commonMessages.ui.showMore)}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

const useProjectPreviewCollection = (
  condition: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition'],
  orderBy: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['orderBy'] = [
    { created_at: 'desc_nulls_last' as types.order_by },
  ],
) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_PROJECT_PREVIEW_COLLECTION,
    types.GET_PROJECT_PREVIEW_COLLECTIONVariables
  >(GET_PROJECT_PREVIEW_COLLECTION, { variables: { condition, orderBy, limit: 10 } })

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
            coverType: v.cover_type,
          }
        })
  const loadMoreProjects =
    (data?.project.length || 0) < (data?.project_aggregate.aggregate?.count || 0)
      ? () =>
          orderBy &&
          fetchMore({
            variables: {
              condition: {
                ...condition,
                ...(Object.keys(orderBy[0])[0] === 'position'
                  ? { position: { _gt: data?.project.slice(-1)[0]?.position } }
                  : { created_at: { _lt: data?.project.slice(-1)[0]?.created_at } }),
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
const useProjectSortCollection = (condition: types.GET_PROJECT_SORT_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROJECT_SORT_COLLECTION,
    types.GET_PROJECT_SORT_COLLECTIONVariables
  >(GET_PROJECT_SORT_COLLECTION, {
    variables: {
      condition,
    },
  })
  const projectSorts: ProjectSortProps[] =
    data?.project.map(v => ({
      id: v.id,
      title: v.title,
      type: v.type,
    })) || []
  return {
    loadingProjectSorts: loading,
    errorProjectSorts: error,
    projectSorts,
    refetchProjectSorts: refetch,
  }
}

const GET_PROJECT_PREVIEW_COLLECTION = gql`
  query GET_PROJECT_PREVIEW_COLLECTION($condition: project_bool_exp!, $orderBy: [project_order_by!], $limit: Int!) {
    project_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    project(where: $condition, order_by: $orderBy, limit: $limit) {
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
      position
      cover_type
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
const GET_PROJECT_SORT_COLLECTION = gql`
  query GET_PROJECT_SORT_COLLECTION($condition: project_bool_exp!) {
    project(where: $condition, order_by: { position: asc }) {
      id
      title
      type
    }
  }
`
const UPDATE_PROJECT_POSITION_COLLECTION = gql`
  mutation UPDATE_PROJECT_POSITION_COLLECTION($data: [project_insert_input!]!) {
    insert_project(objects: $data, on_conflict: { constraint: project_pkey, update_columns: position }) {
      affected_rows
    }
  }
`
export default ProjectCollectionBlock
