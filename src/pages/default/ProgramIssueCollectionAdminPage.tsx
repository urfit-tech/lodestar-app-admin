import { useQuery } from '@apollo/react-hooks'
import { Icon, Select, Skeleton, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import IssueAdminCard from '../../components/issue/IssueAdminCard'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { EditableProgramSelector, OwnedProgramSelector } from '../../components/program/ProgramSelector'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useEditablePrograms } from '../../hooks/program'
import types from '../../types'

const ProgramIssueCollectionAdminPage = () => {
  const { currentMemberId, currentUserRole } = useAuth()
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('unsolved')
  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="book" theme="filled" className="mr-3" />
        <span>課程問題</span>
      </Typography.Title>

      <div className="row mb-4">
        <div className="col-12 col-sm-3 mb-2 mb-md-0">
          <Select style={{ width: '100%' }} value={selectedStatus} onChange={(key: string) => setSelectedStatus(key)}>
            <Select.Option key="unsolved">未解決</Select.Option>
            <Select.Option key="solved">已解決</Select.Option>
            <Select.Option key="all">全部</Select.Option>
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
  const { id: appId } = useContext(AppContext)
  const { programs } = useEditablePrograms(memberId)

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
        '課程問題錯誤'
      ) : !data.issue || data.issue.length === 0 ? (
        '沒有課程問題'
      ) : (
        data.issue
          .map((value: any) => {
            const selectedProgram = programs.find(program => value.thread_id.includes(program.id))

            if (!selectedProgram) {
              return null
            }

            return (
              <IssueAdminCard
                key={value.id}
                threadId={value.thread_id}
                programId={selectedProgram.id}
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
