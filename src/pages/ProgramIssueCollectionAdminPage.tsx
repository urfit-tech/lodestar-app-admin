import { BookFilled } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Select, Skeleton } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import IssueAdminCard from '../components/issue/IssueAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { EditableProgramSelector, OwnedProgramSelector } from '../components/program/ProgramSelector'
import hasura from '../hasura'
import { commonMessages, errorMessages, programMessages } from '../helpers/translation'
import { IssueProps } from '../types/general'
import ForbiddenPage from './ForbiddenPage'

const ProgramIssueCollectionAdminPage = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('unsolved')

  if (!permissions.PROGRAM_ISSUE_ADMIN && !permissions.PROGRAM_ISSUE_NORMAL) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programIssues)}</span>
      </AdminPageTitle>

      <div className="row mb-4">
        <div className="col-12 col-sm-3 mb-2 mb-md-0">
          <Select style={{ width: '100%' }} value={selectedStatus} onChange={(key: string) => setSelectedStatus(key)}>
            <Select.Option value="unsolved">{formatMessage(programMessages.status.issueOpen)}</Select.Option>
            <Select.Option value="solved">{formatMessage(programMessages.status.issueSolved)}</Select.Option>
            <Select.Option value="all">{formatMessage(commonMessages.label.all)}</Select.Option>
          </Select>
        </div>
        <div className="col-12 col-sm-9 pl-md-0">
          {currentMemberId && permissions.PROGRAM_ISSUE_ADMIN && (
            <OwnedProgramSelector
              value={selectedProgramId}
              onChange={key => setSelectedProgramId(Array.isArray(key) ? key[0] : key)}
            />
          )}
          {currentMemberId && permissions.PROGRAM_ISSUE_NORMAL && (
            <EditableProgramSelector
              value={selectedProgramId}
              memberId={currentMemberId}
              onChange={key => setSelectedProgramId(key)}
            />
          )}
        </div>
      </div>
      {currentMemberId && (
        <AllProgramIssueCollectionBlock
          selectedProgramId={selectedProgramId}
          selectedStatus={selectedStatus}
          currentMemberId={currentMemberId}
          permissions={permissions}
        />
      )}
    </AdminLayout>
  )
}

const AllProgramIssueCollectionBlock: React.FC<{
  selectedProgramId: string
  selectedStatus: string
  currentMemberId: string
  permissions: { [key: string]: boolean }
}> = ({ selectedProgramId, selectedStatus, currentMemberId, permissions }) => {
  const { formatMessage } = useIntl()

  let unsolved: boolean | undefined
  switch (selectedStatus) {
    case 'unsolved':
      unsolved = true
      break
    case 'solved':
      unsolved = false
      break
  }

  const { loading, error, issues, refetch } = useGetCreatorProgramIssue(
    permissions.PROGRAM_ISSUE_ADMIN ? null : permissions.PROGRAM_ISSUE_NORMAL ? currentMemberId : '',
    selectedProgramId,
    unsolved,
  )

  return (
    <div>
      {loading && <Skeleton active />}
      {!loading && error && formatMessage(errorMessages.data.fetch)}
      {!loading && issues.length === 0 && formatMessage(programMessages.text.emptyProgramIssue)}

      {issues.map(issue => (
        <IssueAdminCard
          key={issue.id}
          issueId={issue.id}
          threadId={issue.threadId}
          programId={issue.threadId.split('/')[2]}
          title={issue.title}
          description={issue.description}
          reactedMemberIds={issue.reactedMemberIds}
          numReplies={issue.issueRepliesCount}
          createdAt={issue.createdAt}
          solvedAt={issue.solvedAt}
          memberId={issue.issueMemberId}
          onRefetch={refetch}
        />
      ))}
    </div>
  )
}

const useGetCreatorProgramIssue = (memberId: string | null, selectedProgramId: string, unsolved?: boolean) => {
  const { id: appId } = useApp()
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_CREATOR_PROGRAM_ISSUES,
    hasura.GET_CREATOR_PROGRAM_ISSUESVariables
  >(GET_CREATOR_PROGRAM_ISSUES, {
    variables: {
      appId,
      threadIdLike: selectedProgramId === 'all' ? undefined : `/programs/${selectedProgramId}/contents/%`,
      unsolved,
      memberId,
    },
    fetchPolicy: 'no-cache',
  })

  const issues: IssueProps[] =
    loading || error || !data
      ? []
      : data.issue.map(issue => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          solvedAt: issue.solved_at ? new Date(issue.solved_at) : null,
          createdAt: new Date(issue.created_at),
          issueMemberId: issue.member_id,
          threadId: issue.thread_id,
          reactedMemberIds: issue.issue_reactions.map(reaction => reaction.member_id),
          issueRepliesCount: issue?.issue_replies_aggregate?.aggregate?.count || 0,
          issueInstructorIds: issue?.issue_enrollment?.program_roles.map(program_role => program_role.member_id) || [],
        }))

  return {
    loading,
    error,
    issues,
    refetch,
  }
}

const GET_CREATOR_PROGRAM_ISSUES = gql`
  query GET_CREATOR_PROGRAM_ISSUES($appId: String!, $threadIdLike: String, $unsolved: Boolean, $memberId: String) {
    issue(
      where: {
        app_id: { _eq: $appId }
        thread_id: { _like: $threadIdLike }
        solved_at: { _is_null: $unsolved }
        issue_enrollment: { program_roles: { member_id: { _eq: $memberId } } }
      }
      order_by: { created_at: desc }
    ) {
      id
      title
      description
      solved_at
      created_at
      member_id
      thread_id
      issue_reactions {
        member_id
      }
      issue_replies_aggregate {
        aggregate {
          count
        }
      }
      issue_enrollment {
        program_roles(where: { name: { _eq: "instructor" } }) {
          id
          member_id
        }
      }
    }
  }
`

export default ProgramIssueCollectionAdminPage
