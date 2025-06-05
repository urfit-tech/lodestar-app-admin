import axios from 'axios'
import { gql, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura, { InputMaybe, order_by } from '../hasura'
import { MeetingGateway, MemberTaskProps } from '../types/member'
import { useMemberPermissionGroups } from './member'

export const useTask = (queue: string | null, taskId: string | null) => {
  const { authToken } = useAuth()
  const [retry, setRetry] = useState(0)
  const [task, setTask] = useState<{
    returnvalue: any
    failedReason: string
    progress: number
    timestamp: number
    finishedOn: number | null
    processedOn: number | null
  } | null>(null)

  useEffect(() => {
    authToken &&
      taskId &&
      queue &&
      axios
        .get(`${process.env.REACT_APP_API_BASE_ROOT}/tasks/${queue}/${taskId}`, {
          headers: { authorization: `Bearer ${authToken}` },
        })
        .then(({ data: { code, result } }) => {
          if (code === 'SUCCESS') {
            setTask(result)
          }
          if (!result || !result.finishedOn) {
            setTimeout(() => setRetry(v => v + 1), 1000)
          }
        })
  }, [authToken, queue, taskId, retry])
  return { task, retry }
}

export const useMemberTaskCollection = (options?: {
  memberId?: string
  excludedIds: string[]
  setExcludedIds: React.Dispatch<React.SetStateAction<string[]>>
  title?: string
  categoryIds?: string[]
  executor?: string
  author?: string
  dueAt?: Date[]
  createdAt?: Date[]
  status?: string
  limit?: number
  group?: string
  orderBy: hasura.GET_MEMBER_TASK_COLLECTIONVariables['orderBy']
  permissionGroupId?: string
}) => {
  const defaultOrderBy: hasura.member_task_order_by = { created_at: 'desc' as InputMaybe<order_by> }
  const { orderBy = defaultOrderBy } = options || {}
  const memberPropertyGroupName = '組別'
  const { currentMemberId, permissions } = useAuth()
  const { memberPermissionGroups } = useMemberPermissionGroups(currentMemberId || '')

  const baseCondition = {
    title: options?.title ? { _ilike: `%${options.title}%` } : undefined,
    category: options?.categoryIds ? { id: { _in: options.categoryIds } } : undefined,
    executor:
      !options?.executor && !options?.author && options?.group
        ? {
            _or: [
              {
                member_properties: {
                  property: { name: { _eq: memberPropertyGroupName } },
                  value: { _eq: `${options.group}` },
                },
              },
            ],
          }
        : options?.executor && options.group
        ? {
            _or: [{ name: { _eq: `${options.executor}` } }, { username: { _eq: `${options.executor}` } }],
            _and: [
              {
                member_properties: {
                  property: { name: { _eq: memberPropertyGroupName } },
                  value: { _eq: `${options.group}` },
                },
              },
            ],
          }
        : options?.executor
        ? {
            _or: [{ name: { _eq: `${options.executor}` } }, { username: { _eq: `${options.executor}` } }],
          }
        : undefined,
    author:
      !options?.author && !options?.executor && options?.group
        ? {
            _or: [
              {
                member_properties: {
                  property: { name: { _eq: memberPropertyGroupName } },
                  value: { _eq: `${options.group}` },
                },
              },
            ],
          }
        : options?.author && options.group
        ? {
            _or: [{ name: { _eq: `${options.author}` } }, { username: { _eq: `${options.author}` } }],
            _and: [
              {
                member_properties: {
                  property: { name: { _eq: memberPropertyGroupName } },
                  value: { _eq: `${options.group}` },
                },
              },
            ],
          }
        : options?.author
        ? {
            _or: [{ name: { _eq: `${options.author}` } }, { username: { _eq: `${options.author}` } }],
          }
        : undefined,
    due_at: options?.dueAt ? { _gte: options?.dueAt[0], _lte: options?.dueAt[1] } : undefined,
    created_at: options?.createdAt ? { _gte: options?.createdAt[0], _lte: options?.createdAt[1] } : undefined,
    status: options?.status ? { _eq: options.status } : undefined,
    deleted_at: { _is_null: true },
  }

  const condition: hasura.GET_MEMBER_TASK_COLLECTIONVariables['condition'] = 
    options?.memberId 
      ? {
          ...baseCondition,
          member_id: { _eq: options.memberId },
          deleted_at: { _is_null: true },
        }
      : permissions?.TASK_READ_GROUP_ALL && memberPermissionGroups.length > 0
      ? {
          ...baseCondition,
          executor: {
            member_permission_groups: {
              permission_group_id: {
                _in: memberPermissionGroups.map(p => p.permission_group_id),
              },
            },
          },
          deleted_at: { _is_null: true },
        }
      : {
          ...baseCondition,
          member_id: {_eq: options?.memberId,},
      }

  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_MEMBER_TASK_COLLECTION,
    hasura.GET_MEMBER_TASK_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_TASK_COLLECTION(
        $condition: member_task_bool_exp
        $limit: Int
        $offset: Int
        $orderBy: member_task_order_by!
        $propertyNames: [String!]
      ) {
        executors: member_task(
          where: { executor_id: { _is_null: false }, deleted_at: { _is_null: true } }
          distinct_on: [executor_id]
        ) {
          id
          executor {
            id
            name
            member_properties(where: { property: { name: { _in: $propertyNames } } }) {
              property {
                name
              }
              value
            }
          }
        }
        authors: member_task(
          where: { author_id: { _is_null: false }, deleted_at: { _is_null: true } }
          distinct_on: [author_id]
        ) {
          id
          author {
            id
            name
            member_properties(where: { property: { name: { _in: $propertyNames } } }) {
              property {
                name
              }
              value
            }
          }
        }
        member_task_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_task(where: $condition, limit: $limit, offset: $offset, order_by: [$orderBy]) {
          id
          title
          description
          priority
          status
          due_at
          created_at
          has_meeting
          meeting_gateway
          meeting_hours
          is_private
          meet {
            id
            started_at
            ended_at
            exp_at
            nbf_at
            options
          }
          category {
            id
            name
          }
          member {
            id
            name
            username
          }
          executor {
            id
            name
            username
            picture_url
          }
          author {
            id
            name
            username
            picture_url
          }
        }
      }
    `,
    {
      variables: {
        condition,
        orderBy,
        limit: options?.limit,
        propertyNames: [memberPropertyGroupName],
      },
      // Use 'network-only' fetchPolicy to ensure Apollo Client doesn't use cache for the same query, and always fetches fresh data from the db.
      fetchPolicy: 'network-only',
    },
  )

  const memberTasks: MemberTaskProps[] =
  data?.member_task.map(v => ({
    id: v.id,
    title: v.title || '',
    priority: v.priority as MemberTaskProps['priority'],
    status: v.status as MemberTaskProps['status'],
    category: v.category
      ? {
          id: v.category.id,
          name: v.category.name,
        }
      : null,
    dueAt: v.due_at && new Date(v.due_at),
    createdAt: v.created_at && new Date(v.created_at),
    hasMeeting: v.has_meeting,
    meetingGateway: v.meeting_gateway as MeetingGateway,
    meetingHours: v.meeting_hours,
    meet: {
      id: v.meet?.id,
      startedAt: v.meet?.started_at,
      endedAt: v.meet?.ended_at,
      nbfAt: v.meet?.nbf_at,
      expAt: v.meet?.exp_at,
      options: v.meet?.options,
    },
    description: v.description || '',
    member: {
      id: v.member.id,
      name: v.member.name || v.member.username,
    },
    executor: v.executor
      ? {
          id: v.executor.id,
          name: v.executor.name || v.executor.username,
          avatarUrl: v.executor.picture_url || null,
        }
      : null,
    author: v.author
      ? {
          id: v.author.id,
          name: v.author.name || v.author.username,
          avatarUrl: v.author.picture_url || null,
        }
      : null,
    isPrivate: v.is_private,
  })) || []

  const permissionGroupMemberIds =
    permissions?.TASK_READ_GROUP_ALL && memberPermissionGroups.length > 0
      ? memberTasks
        .filter(task => task.executor)
        .map(task => task.executor!.id)
      : undefined

  const executors: {
    id: string
    name: string
    group?: string
  }[] =
    data?.executors
      .filter(v => !permissionGroupMemberIds || (v.executor && permissionGroupMemberIds.includes(v.executor.id)))
      .map(v => ({
        id: v.executor?.id || '',
        name: v.executor?.name || '',
        group: v.executor?.member_properties.find(mp => mp.property.name === memberPropertyGroupName)?.value,
      })) || []

  const authors: {
    id: string
    name: string
    group?: string
  }[] =
    data?.authors
      .filter(v => !permissionGroupMemberIds || memberTasks.some(task => task.executor?.id && task.author?.id === v.author?.id && permissionGroupMemberIds.includes(task.executor.id)))
      .map(v => ({
        id: v.author?.id || '',
        name: v.author?.name || '',
        group: v.author?.member_properties.find(mp => mp.property.name === memberPropertyGroupName)?.value,
      })) || []

  const loadMoreMemberTasks =
    (data?.member_task_aggregate.aggregate?.count || 0) > (data?.member_task.length || 0)
      ? () =>
          fetchMore({
            variables: {
              orderBy,
              condition: {
                ...condition,
              },
              limit: options?.limit,
              offset: data?.member_task.length || 0,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                member_task_aggregate: fetchMoreResult.member_task_aggregate,
                member_task: [...prev.member_task, ...fetchMoreResult.member_task],
              })
            },
          })
      : undefined

  return {
    loadingMemberTasks: loading,
    errorMemberTasks: error,
    executors,
    authors,
    memberTasks,
    refetchMemberTasks: refetch,
    loadMoreMemberTasks,
  }
}

export const useMemberTask = (taskId: string) => {
  const { data } = useQuery<hasura.GetMemberTaskById, hasura.GetMemberTaskByIdVariables>(
    gql`
      query GetMemberTaskById($id: String!) {
        member_task_by_pk(id: $id) {
          id
          title
          description
          priority
          status
          due_at
          created_at
          has_meeting
          meeting_gateway
          meeting_hours
          is_private
          meet {
            id
            started_at
            ended_at
            exp_at
            nbf_at
          }
          category {
            id
            name
          }
          member {
            id
            name
            username
          }
          executor {
            id
            name
            username
            picture_url
          }
          author {
            id
            name
            username
            picture_url
          }
        }
      }
    `,
    { variables: { id: taskId } },
  )

  const memberTask: MemberTaskProps | null = data?.member_task_by_pk
    ? {
        id: data?.member_task_by_pk.id,
        title: data?.member_task_by_pk.title || '',
        priority: data?.member_task_by_pk.priority as MemberTaskProps['priority'],
        status: data?.member_task_by_pk.status as MemberTaskProps['status'],
        category: data?.member_task_by_pk.category
          ? {
              id: data?.member_task_by_pk.category.id,
              name: data?.member_task_by_pk.category.name,
            }
          : null,
        dueAt: data?.member_task_by_pk.due_at && new Date(data?.member_task_by_pk.due_at),
        createdAt: data?.member_task_by_pk.created_at && new Date(data?.member_task_by_pk.created_at),
        hasMeeting: data?.member_task_by_pk.has_meeting,
        meetingGateway: data?.member_task_by_pk.meeting_gateway as MeetingGateway,
        meetingHours: data?.member_task_by_pk.meeting_hours,
        meet: {
          id: data?.member_task_by_pk.meet?.id,
          startedAt: data?.member_task_by_pk.meet?.started_at,
          endedAt: data?.member_task_by_pk.meet?.ended_at,
          nbfAt: data?.member_task_by_pk.meet?.nbf_at,
          expAt: data?.member_task_by_pk.meet?.exp_at,
        },
        description: data?.member_task_by_pk.description || '',
        member: {
          id: data?.member_task_by_pk.member.id,
          name: data?.member_task_by_pk.member.name || data?.member_task_by_pk.member.username,
        },
        executor: data?.member_task_by_pk.executor
          ? {
              id: data?.member_task_by_pk.executor.id,
              name: data?.member_task_by_pk.executor.name || data?.member_task_by_pk.executor.username,
              avatarUrl: data?.member_task_by_pk.executor.picture_url || null,
            }
          : null,
        author: data?.member_task_by_pk.author
          ? {
              id: data?.member_task_by_pk.author.id,
              name: data?.member_task_by_pk.author.name || data?.member_task_by_pk.author.username,
              avatarUrl: data?.member_task_by_pk.author.picture_url || null,
            }
          : null,
        isPrivate: data?.member_task_by_pk.is_private,
      }
    : null

  return { memberTask }
}
