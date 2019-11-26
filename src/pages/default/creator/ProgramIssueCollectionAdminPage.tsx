import { useQuery } from '@apollo/react-hooks'
import { Checkbox, Icon, Select, Skeleton, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import IssueAdminCard from '../../../components/issue/IssueAdminCard'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import { EnrolledProgramSelector } from '../../../components/program/ProgramSelector'
import { useEnrolledProgramIds } from '../../../hooks/program'
import { ReactComponent as BookIcon } from '../../../images/default/book.svg'
import types from '../../../types'

const ProgramIssueCollectionAdminPage = () => {
  const { currentMemberId } = useAuth()
  const [selectedProgramId, setSelectedProgramId] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('unsolved')
  const [allowOthersIssue, setAllowOthersIssue] = useState(false)

  return (
    <MemberAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>課程問題</span>
      </Typography.Title>

      <div className="row no-gutters mb-4">
        <div className="col-12 col-sm-2 pr-sm-3">
          <Select style={{ width: '100%' }} value={selectedStatus} onChange={(key: string) => setSelectedStatus(key)}>
            <Select.Option key="unsolved">未解決</Select.Option>
            <Select.Option key="solved">已解決</Select.Option>
            <Select.Option key="all">全部</Select.Option>
          </Select>
        </div>
        <div className="col-12 col-sm-8 pr-sm-3">
          {currentMemberId && (
            <EnrolledProgramSelector
              value={selectedProgramId}
              memberId={currentMemberId}
              onChange={key => setSelectedProgramId(key)}
            />
          )}
        </div>
        <div className="col-12 col-sm-2 d-flex align-items-center">
          <Checkbox onChange={e => setAllowOthersIssue(e.target.checked)}>查看所有人問題</Checkbox>
        </div>
      </div>

      {currentMemberId && (
        <AllProgramIssueCollectionBlock
          memberId={currentMemberId}
          selectedProgramId={selectedProgramId}
          selectedStatus={selectedStatus}
          allowOthersIssue={allowOthersIssue}
        />
      )}
    </MemberAdminLayout>
  )
}

const AllProgramIssueCollectionBlock: React.FC<{
  memberId: string
  selectedProgramId: string
  selectedStatus: string
  allowOthersIssue?: boolean
}> = ({ memberId, selectedProgramId, selectedStatus, allowOthersIssue }) => {
  const { enrolledProgramIds } = useEnrolledProgramIds(memberId, true)

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
    types.GET_MEMBER_PROGRAM_ISSUES,
    types.GET_MEMBER_PROGRAM_ISSUESVariables
  >(GET_MEMBER_PROGRAM_ISSUES, {
    variables: {
      memberId: allowOthersIssue ? undefined : memberId,
      appId: process.env.REACT_APP_ID || '',
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
            const programId = enrolledProgramIds.find(id => value.thread_id.includes(id))

            if (!programId) {
              return null
            }

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
                solvedAt={value.solved_at && new Date(value.solved_at)}
                onRefetch={refetch}
              />
            )
          })
          .flat()
      )}
    </div>
  )
}

const GET_MEMBER_PROGRAM_ISSUES = gql`
  query GET_MEMBER_PROGRAM_ISSUES($appId: String!, $threadIdLike: String, $unsolved: Boolean, $memberId: String) {
    issue(
      where: {
        app_id: { _eq: $appId }
        member_id: { _eq: $memberId }
        thread_id: { _like: $threadIdLike }
        solved_at: { _is_null: $unsolved }
      }
      order_by: [
        { created_at: desc }
        # { issue_reactions_aggregate: { count: desc } }
      ]
    ) {
      id
      title
      thread_id
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

export default ProgramIssueCollectionAdminPage
