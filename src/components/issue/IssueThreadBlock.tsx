import { Divider, Spin } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { StringParam, useQueryParam } from 'use-query-params'
import { InferType } from 'yup'
import { programRoleSchema } from '../../schemas/program'
import { useAuth } from '../auth/AuthContext'
import IssueCreationModal from './IssueCreationModal'
import IssueItem from './IssueItem'

type IssueThreadBlockProps = {
  threadId: string
  programRoles: InferType<typeof programRoleSchema>[]
}
const IssueThreadBlock: React.FC<IssueThreadBlockProps> = ({ threadId, programRoles }) => {
  const [qIssueId] = useQueryParam('issueId', StringParam)
  const [qIssueReplyId] = useQueryParam('issueReplyId', StringParam)
  const { currentMemberId } = useAuth()
  const { data, loading, error, refetch } = useQuery(GET_ISSUE_THREAD, {
    variables: {
      appId: process.env.REACT_APP_ID,
      threadId,
    },
  })

  return (
    <div>
      {currentMemberId && (
        <IssueCreationModal
          onSubmit={() => {
            refetch()
          }}
          memberId={currentMemberId}
          threadId={threadId}
        />
      )}

      {loading ? (
        <Spin />
      ) : error ? (
        '無法取得問題'
      ) : (
        data.issue.map((value: any) => {
          return (
            <div key={value.id}>
              <IssueItem
                programRoles={programRoles}
                issueId={value.id}
                title={value.title}
                description={value.description}
                reactedMemberIds={value.issue_reactions.map((value: any) => value.member_id)}
                numReplies={value.issue_replies_aggregate.aggregate.count}
                createdAt={new Date(value.created_at)}
                memberId={value.member_id}
                solvedAt={value.solved_at && new Date(value.solved_at)}
                onRefetch={() => refetch()}
                defaultRepliesVisible={(qIssueReplyId && qIssueId === value.id) || false}
              />
              <Divider />
            </div>
          )
        })
      )}
    </div>
  )
}

const GET_ISSUE_THREAD = gql`
  query GET_ISSUE_THREAD($appId: String!, $threadId: String!) {
    issue(
      where: { app_id: { _eq: $appId }, thread_id: { _eq: $threadId } }
      order_by: [
        { created_at: desc }
        # { issue_reactions_aggregate: { count: desc } }
      ]
    ) {
      id
      title
      description
      solved_at
      created_at
      member_id
      issue_reactions {
        member_id
      }
      issue_replies_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

export default IssueThreadBlock
