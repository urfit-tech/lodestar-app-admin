import { useQuery } from '@apollo/react-hooks'
import { Icon, Select, Skeleton, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import IssueAdminCard from '../../components/issue/IssueAdminCard'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { EditableProgramSelector, OwnedProgramSelector } from '../../components/program/ProgramSelector'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import types from '../../types'

const ProgramIssueCollectionAdminPage = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('unsolved')
  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="book" theme="filled" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programIssues)}</span>
      </Typography.Title>

      <div className="row mb-4">
        <div className="col-12 col-sm-3 mb-2 mb-md-0">
          <Select style={{ width: '100%' }} value={selectedStatus} onChange={(key: string) => setSelectedStatus(key)}>
            <Select.Option key="unsolved">{formatMessage(programMessages.status.issueOpen)}</Select.Option>
            <Select.Option key="solved">{formatMessage(programMessages.status.issueSolved)}</Select.Option>
            <Select.Option key="all">{formatMessage(commonMessages.label.all)}</Select.Option>
          </Select>
        </div>
        <div className="col-12 col-sm-9 pl-md-0">
          {currentMemberId && currentUserRole === 'app-owner' && (
            <OwnedProgramSelector value={selectedProgramId} onChange={key => setSelectedProgramId(key)} />
          )}
          {currentMemberId && currentUserRole === 'content-creator' && (
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
          memberId={currentMemberId}
          selectedProgramId={selectedProgramId}
          selectedStatus={selectedStatus}
        />
      )}
    </AdminLayout>
  )
}

const AllProgramIssueCollectionBlock: React.FC<{
  memberId: string
  selectedProgramId: string
  selectedStatus: string
}> = ({ memberId, selectedProgramId, selectedStatus }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)

  let unsolved: boolean | undefined
  switch (selectedStatus) {
    case 'unsolved':
      unsolved = true
      break
    case 'solved':
      unsolved = false
      break
    default:
      unsolved = undefined
      break
  }

  const { loading, error, data, refetch } = useQuery<
    types.GET_CREATOR_PROGRAM_ISSUES,
    types.GET_CREATOR_PROGRAM_ISSUESVariables
  >(GET_CREATOR_PROGRAM_ISSUES, {
    variables: {
      appId,
      threadIdLike: selectedProgramId === 'all' ? undefined : `/programs/${selectedProgramId}/contents/%`,
      unsolved,
    },
  })

  return (
    <div>
      {loading || !data ? (
        <Skeleton active />
      ) : error ? (
        formatMessage(errorMessages.data.fetch)
      ) : !data.issue || data.issue.length === 0 ? (
        formatMessage(programMessages.text.emptyProgramIssue)
      ) : (
        data.issue
          .map((value: any) => {
            const [, , programId] = value.thread_id.split('/')
            return (
              <IssueAdminCard
                key={value.id}
                threadId={value.thread_id}
                programId={programId}
                issueId={value.id}
                title={value.title}
                description={value.description}
                reactedMemberIds={value.issue_reactions.map((value: any) => value.member_id)}
                numReplies={value.issue_replies_aggregate.aggregate.count}
                createdAt={new Date(value.created_at)}
                memberId={value.member_id}
                solvedAt={value.solved_at ? new Date(value.solved_at) : null}
                onRefetch={refetch}
              />
            )
          })
          .flat()
      )}
    </div>
  )
}

const GET_CREATOR_PROGRAM_ISSUES = gql`
  query GET_CREATOR_PROGRAM_ISSUES($appId: String!, $threadIdLike: String, $unsolved: Boolean) {
    issue(
      where: { app_id: { _eq: $appId }, thread_id: { _like: $threadIdLike }, solved_at: { _is_null: $unsolved } }
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
      thread_id
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

export default ProgramIssueCollectionAdminPage
