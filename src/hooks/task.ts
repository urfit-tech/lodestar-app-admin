import axios from 'axios'
import { gql, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura, { InputMaybe, order_by } from '../hasura'
import { MeetingGateway, MemberTaskProps } from '../types/member'

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
  status?: string
  limit?: number
  orderBy: hasura.GET_MEMBER_TASK_COLLECTIONVariables['orderBy']
}) => {
  const defaultOrderBy: hasura.member_task_order_by = { created_at: 'desc' as InputMaybe<order_by> }

  const { orderBy = defaultOrderBy } = options || {}
  const condition: hasura.GET_MEMBER_TASK_COLLECTIONVariables['condition'] = {
    member_id: { _eq: options?.memberId },
    title: options?.title ? { _ilike: `%${options.title}%` } : undefined,
    category: options?.categoryIds ? { id: { _in: options.categoryIds } } : undefined,
    executor: options?.executor
      ? { _or: [{ name: { _ilike: `%${options.executor}%` } }, { username: { _ilike: `%${options.executor}%` } }] }
      : undefined,
    author: options?.author
      ? { _or: [{ name: { _ilike: `%${options.author}%` } }, { username: { _ilike: `%${options.author}%` } }] }
      : undefined,
    due_at: options?.dueAt ? { _gte: options?.dueAt[0], _lte: options?.dueAt[1] } : undefined,
    status: options?.status ? { _ilike: options.status } : undefined,
    deleted_at: { _is_null: true },
  }

  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_MEMBER_TASK_COLLECTION,
    hasura.GET_MEMBER_TASK_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_TASK_COLLECTION($condition: member_task_bool_exp, $limit: Int, $orderBy: member_task_order_by!) {
        executors: member_task(
          where: { executor_id: { _is_null: false }, deleted_at: { _is_null: true } }
          distinct_on: [executor_id]
        ) {
          id
          executor {
            id
            name
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
          }
        }
        member_task_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_task(where: $condition, limit: $limit, order_by: [$orderBy]) {
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
    {
      variables: {
        condition,
        orderBy,
        limit: options?.limit,
      },
      // Use 'network-only' fetchPolicy to ensure Apollo Client doesn't use cache for the same query, and always fetches fresh data from the db.
      fetchPolicy: 'network-only',
    },
  )

  const executors: {
    id: string
    name: string
  }[] =
    data?.executors.map(v => ({
      id: v.executor?.id || '',
      name: v.executor?.name || '',
    })) || []

  const authors: {
    id: string
    name: string
  }[] =
    data?.authors.map(v => ({
      id: v.author?.id || '',
      name: v.author?.name || '',
    })) || []

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
    })) || []

  const loadMoreMemberTasks =
    (data?.member_task_aggregate.aggregate?.count || 0) > (options?.limit || 0)
      ? () =>
          fetchMore({
            variables: {
              orderBy,
              condition: {
                ...condition,
                id: { _nin: options?.excludedIds },
                created_at: orderBy.created_at
                  ? { [orderBy.created_at === 'desc' ? '_lt' : '_gt']: data?.member_task.slice(-1)[0]?.created_at }
                  : undefined,
                due_at: orderBy.due_at
                  ? { [orderBy.due_at === 'desc' ? '_lt' : '_gt']: data?.member_task.slice(-1)[0]?.due_at }
                  : undefined,
              },
              limit: options?.limit,
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
