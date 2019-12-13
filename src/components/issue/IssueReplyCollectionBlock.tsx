import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import { InferType } from 'yup'
import { programRoleSchema } from '../../schemas/program'
import types from '../../types'
import { useAuth } from '../auth/AuthContext'
import IssueReplyCreationBlock from './IssueReplyCreationBlock'
import IssueReplyItem from './IssueReplyItem'

interface IssueReplyCollectionBlockProps {
  programRoles: InferType<typeof programRoleSchema>[]
  issueId: string
}
const IssueReplyCollectionBlock: React.FC<IssueReplyCollectionBlockProps> = ({ programRoles, issueId }) => {
  const { currentMemberId } = useAuth()
  const { loading, data, error, refetch } = useQuery<types.GET_ISSUE_REPLIES, types.GET_ISSUE_REPLIESVariables>(
    GET_ISSUE_REPLIES,
    {
      variables: { issueId },
    },
  )

  return (
    <>
      {loading
        ? '載入回覆中'
        : error || !data
        ? '無法載入回覆'
        : data.issue_reply.map((value: any) => (
            <div key={value.id} className="mt-5">
              <IssueReplyItem
                programRoles={programRoles}
                issueReplyId={value.id}
                memberId={value.member_id}
                content={value.content}
                createdAt={new Date(value.created_at)}
                reactedMemberIds={value.issue_reply_reactions.map((value: any) => value.public_member.id)}
                onRefetch={() => refetch()}
              />
            </div>
          ))}
      {currentMemberId && (
        <div className="mt-5">
          <IssueReplyCreationBlock memberId={currentMemberId} issueId={issueId} onRefetch={() => refetch()} />
        </div>
      )}
    </>
  )
}

const GET_ISSUE_REPLIES = gql`
  query GET_ISSUE_REPLIES($issueId: uuid!) {
    issue_reply(where: { issue_id: { _eq: $issueId } }, order_by: [{ created_at: asc }]) {
      id
      content
      created_at
      member_id
      issue_reply_reactions {
        public_member {
          id
          name
        }
      }
    }
  }
`

export default IssueReplyCollectionBlock
