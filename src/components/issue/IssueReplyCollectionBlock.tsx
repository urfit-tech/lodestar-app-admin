import { gql, useQuery } from '@apollo/client'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramRoleProps } from '../../types/program'
import IssueReplyCreationBlock from './IssueReplyCreationBlock'
import IssueReplyItem from './IssueReplyItem'

const IssueReplyCollectionBlock: React.FC<{
  programRoles: ProgramRoleProps[]
  issueId: string
}> = ({ programRoles, issueId }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { loading, data, error, refetch } = useQuery<hasura.GET_ISSUE_REPLIES, hasura.GET_ISSUE_REPLIESVariables>(
    GET_ISSUE_REPLIES,
    { variables: { issueId } },
  )

  return (
    <>
      {loading
        ? formatMessage(commonMessages.event.loading)
        : error || !data
        ? formatMessage(errorMessages.data.fetch)
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
