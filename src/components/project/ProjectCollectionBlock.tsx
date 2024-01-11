import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Skeleton } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { sum } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MarkedProjectRoleProps, ProjectDataType, ProjectPreviewProps, ProjectSortProps } from '../../types/project'
import { EmptyBlock } from '../admin'
import ItemsSortingModal from '../common/ItemsSortingModal'
import ProjectAdminCard from './ProjectAdminCard'
import ProjectCollectionTable from './ProjectCollectionTable'
import projectMessages from './translation'

const ProjectCollectionBlock: React.FC<{
  appId: string
  projectType: ProjectDataType
  condition: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']
  markedRoleCondition?: hasura.GET_MARKED_PROJECT_ROLESVariables['condition']
  orderBy?: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['orderBy']
  tabContentKey: String
  withSortingButton?: boolean
  onReady?: (count: number) => void
}> = ({ appId, projectType, condition, orderBy, withSortingButton, markedRoleCondition, tabContentKey, onReady }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const { loadingProject, projectPreview, projectPreviewCount, refetchProject, loadMoreProjects } =
    useProjectPreviewCollection(
      {
        ...condition,
        title: search ? { _like: `%${search}%` } : undefined,
      },
      orderBy,
    )
  const {
    loadingMarkedProjectRoles,
    loadMoreMarkedProjectRoles,
    refetchMarkedProjectRoles,
    markedProjectRolesCount,
    markedProjectRoles,
  } = useMarkedProjectRole(currentMemberId || '', projectType, markedRoleCondition || {})

  const { projectSorts, refetchProjectSorts } = useProjectSortCollection(condition)
  const [updatePositions] = useMutation<
    hasura.UPDATE_PROJECT_POSITION_COLLECTION,
    hasura.UPDATE_PROJECT_POSITION_COLLECTIONVariables
  >(UPDATE_PROJECT_POSITION_COLLECTION)

  const handleSearch = (search: string) => {
    setSearch(search)
  }

  const tabCount = tabContentKey === 'marked' ? markedProjectRolesCount : projectPreviewCount
  useEffect(() => {
    onReady?.(tabCount || 0)
    refetchProject()
    refetchMarkedProjectRoles()
  }, [onReady, tabCount, refetchProject, refetchMarkedProjectRoles])

  if ((loadingProject || loadingMarkedProjectRoles) && search === '') {
    return <Skeleton active />
  }

  if (projectPreview.length === 0 && search === '') {
    return <EmptyBlock>{formatMessage(projectMessages['*'].noProject)}</EmptyBlock>
  }

  const refetchAndLoadProjectRoles = async () => {
    await refetchMarkedProjectRoles({ limit: markedProjectRoles.length })
  }

  return (
    <>
      {withSortingButton && projectType !== 'portfolio' && (
        <div className="text-right">
          <ItemsSortingModal
            items={projectSorts}
            triggerText={formatMessage(projectMessages['*'].sortProject)}
            onSubmit={values =>
              updatePositions({
                variables: {
                  data: values.map((value, index) => ({
                    id: value.id,
                    title: value.title || '',
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
      {projectType === 'portfolio' ? (
        <ProjectCollectionTable
          projects={projectPreview}
          markedProjectRole={markedProjectRoles}
          onSearch={handleSearch}
          type={tabContentKey === 'marked' ? 'marked' : 'normal'}
          onLoadMoreSubmit={setLoadMoreLoading => {
            const loadMoreRowData = tabContentKey === 'marked' ? loadMoreMarkedProjectRoles : loadMoreProjects
            if (loadMoreRowData) {
              loadMoreRowData?.()
                ?.catch(handleError)
                .finally(() => setLoadMoreLoading(false))
              return true
            } else {
              return false
            }
          }}
          onRefetch={refetchAndLoadProjectRoles}
        />
      ) : (
        <div className="row py-3">
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
      )}
    </>
  )
}

const useProjectPreviewCollection = (
  condition: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition'],
  orderBy: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['orderBy'] = [
    { published_at: 'desc_nulls_last' as hasura.order_by },
  ],
) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_PROJECT_PREVIEW_COLLECTION,
    hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables
  >(GET_PROJECT_PREVIEW_COLLECTION, { variables: { condition, orderBy, limit: 10 } })

  const projectPreview: ProjectPreviewProps[] =
    loading || error || !data
      ? []
      : data.project.map(v => {
          return {
            id: v.id,
            title: v.title || '',
            abstract: v.abstract || '',
            author: {
              id: v.project_roles[0]?.member?.id || '',
              name: v.project_roles[0]?.member?.name || '',
              pictureUrl: v.project_roles[0]?.member?.picture_url || '',
            },
            projectType: v.type as ProjectDataType,
            createdAt: v.created_at,
            publishedAt: v.published_at,
            expiredAt: v.expired_at,
            coverUrl: v.cover_url || null,
            previewUrl: v.preview_url || null,
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
                ...(Object.keys(Array.isArray(orderBy) ? orderBy[0] : orderBy)[0] === 'position'
                  ? { position: { _gt: data?.project.slice(-1)[0]?.position } }
                  : { published_at: { _lt: data?.project.slice(-1)[0]?.published_at } }),
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
const useProjectSortCollection = (condition: hasura.GET_PROJECT_SORT_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROJECT_SORT_COLLECTION,
    hasura.GET_PROJECT_SORT_COLLECTIONVariables
  >(GET_PROJECT_SORT_COLLECTION, {
    variables: {
      condition,
    },
  })
  const projectSorts: ProjectSortProps[] =
    data?.project.map(v => ({
      id: v.id,
      title: v.title || '',
      type: v.type,
    })) || []
  return {
    loadingProjectSorts: loading,
    errorProjectSorts: error,
    projectSorts,
    refetchProjectSorts: refetch,
  }
}

const useMarkedProjectRole = (
  memberId: hasura.GET_MARKED_PROJECT_ROLESVariables['memberId'],
  projectType: hasura.GET_MARKED_PROJECT_ROLESVariables['projectType'],
  condition: hasura.GET_MARKED_PROJECT_ROLESVariables['condition'],
  limit: hasura.GET_MARKED_PROJECT_ROLESVariables['limit'] = 10,
) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_MARKED_PROJECT_ROLES,
    hasura.GET_MARKED_PROJECT_ROLESVariables
  >(GET_MARKED_PROJECT_ROLES, {
    variables: {
      memberId,
      projectType,
      condition,
      limit,
    },
  })
  const markedProjectRoles: MarkedProjectRoleProps[] =
    data?.marked_project_role.map(projectRole => ({
      id: projectRole.id,
      agreedAt: projectRole.agreed_at,
      createdAt: projectRole.created_at,
      identity: projectRole.identity,
      title: projectRole.project.title,
      author: {
        id: projectRole.project.project_roles[0]?.member?.id || '',
        name: projectRole.project.project_roles[0]?.member?.name || '',
        pictureUrl: projectRole.project.project_roles[0]?.member?.picture_url || '',
      },
      previewUrl: projectRole.project.preview_url || null,
    })) || []
  const loadMoreMarkedProjectRoles =
    (data?.marked_project_role.length || 0) < (data?.project_role_aggregate.aggregate?.count || 0)
      ? (limit: number = 10) =>
          fetchMore({
            variables: {
              memberId,
              projectType,
              limit,
              condition: { created_at: { _lt: data?.marked_project_role.slice(-1)[0]?.created_at } },
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                project_role_aggregate: prev.project_role_aggregate,
                marked_project_role: [...prev.marked_project_role, ...fetchMoreResult.marked_project_role],
              }
            },
          })
      : undefined
  return {
    loadingMarkedProjectRoles: loading,
    errorMarkedProjectRoles: error,
    markedProjectRoles,
    refetchMarkedProjectRoles: refetch,
    loadMoreMarkedProjectRoles,
    markedProjectRolesCount: data?.project_role_aggregate.aggregate?.count || 0,
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
      project_roles(where: { identity: { name: { _eq: "author" } } }) {
        member {
          id
          name
          picture_url
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
const GET_MARKED_PROJECT_ROLES = gql`
  query GET_MARKED_PROJECT_ROLES(
    $memberId: String!
    $projectType: String!
    $condition: project_role_bool_exp!
    $limit: Int!
  ) {
    project_role_aggregate(
      where: { member_id: { _eq: $memberId }, identity: { name: { _neq: "author" } }, rejected_at: { _is_null: true } }
    ) {
      aggregate {
        count
      }
    }
    marked_project_role: project_role(
      order_by: { created_at: desc_nulls_last }
      limit: $limit
      where: {
        _and: [
          $condition
          { project: { type: { _eq: $projectType } } }
          { member_id: { _eq: $memberId }, identity: { name: { _neq: "author" } }, rejected_at: { _is_null: true } }
        ]
      }
    ) {
      project {
        id
        title
        preview_url
        type
        project_roles(where: { identity: { name: { _eq: "author" } } }) {
          member {
            id
            name
            picture_url
          }
        }
      }
      id
      agreed_at
      created_at
      identity {
        id
        name
      }
    }
  }
`

export default ProjectCollectionBlock
