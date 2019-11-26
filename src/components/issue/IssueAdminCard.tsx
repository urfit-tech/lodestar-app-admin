import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Modal } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import styled from 'styled-components'
import { useProgram } from '../../hooks/program'
import types from '../../types'
import { useAuth } from '../auth/AuthContext'
import AdminCard from '../common/AdminCard'
import IssueItem from './IssueItem'

const StyledAdminCard = styled(AdminCard)`
  position: relative;

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    cursor: pointer;
    content: '';
    z-index: 998;
  }
`
const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 999;
`

type IssueAdminCardProps = CardProps & {
  threadId: string
  programId: string
  issueId: string
  title: string
  description: string
  reactedMemberIds: string[]
  numReplies: number
  createdAt: Date
  memberId: string
  solvedAt: Date
  onRefetch?: () => void
}
const IssueAdminCard: React.FC<IssueAdminCardProps> = ({
  threadId,
  programId,
  issueId,
  title,
  description,
  reactedMemberIds,
  numReplies,
  createdAt,
  memberId,
  solvedAt,
  onRefetch,
  ...cardProps
}) => {
  const { currentMemberId } = useAuth()
  const { program } = useProgram(programId)
  const [updateIssueStatus] = useMutation<types.UPDATE_ISSUE_STATUS, types.UPDATE_ISSUE_STATUSVariables>(
    UPDATE_ISSUE_STATUS,
  )

  const [solved, setSolved] = useState(!!solvedAt)
  const [modalVisible, setModalVisible] = useState()

  const programRoles = (program && program.roles) || []
  const programTitle = program ? program.title || '無課程標題' : ''

  return (
    <>
      <StyledAdminCard className="mb-3" {...cardProps}>
        <IssueItem
          programRoles={programRoles}
          issueId={issueId}
          title={title}
          description={description}
          reactedMemberIds={reactedMemberIds}
          numReplies={numReplies}
          createdAt={createdAt}
          memberId={memberId}
          solvedAt={solvedAt}
          onRefetch={onRefetch}
          defaultRepliesVisible={false}
          showSolvedCheckbox={true}
        />

        <div className="mask" onClick={() => setModalVisible(true)} />

        {currentMemberId === memberId ||
        programRoles
          .filter(role => role.memberId === currentMemberId)
          .some(role => role.name === 'instructor' || role.name === 'assistant') ? (
          <StyledCheckbox
            checked={solved}
            onChange={e => {
              const updatedSolved = e.target.checked
              updateIssueStatus({
                variables: {
                  issueId,
                  solvedAt: updatedSolved ? new Date() : null,
                },
              }).then(() => setSolved(updatedSolved))
            }}
          >
            {solvedAt ? '已解決' : '解決中'}
          </StyledCheckbox>
        ) : null}
      </StyledAdminCard>

      <Modal
        footer={null}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={
          <div>
            <span>{programTitle}</span>
            <Button type="link" onClick={() => window.open(threadId)}>
              查看課程內容
            </Button>
          </div>
        }
      >
        <IssueItem
          programRoles={programRoles}
          issueId={issueId}
          title={title}
          description={description}
          reactedMemberIds={reactedMemberIds}
          numReplies={numReplies}
          createdAt={createdAt}
          memberId={memberId}
          solvedAt={solvedAt}
          onRefetch={onRefetch}
          defaultRepliesVisible={true}
        />
      </Modal>
    </>
  )
}

const UPDATE_ISSUE_STATUS = gql`
  mutation UPDATE_ISSUE_STATUS($issueId: uuid!, $solvedAt: timestamptz) {
    update_issue(where: { id: { _eq: $issueId } }, _set: { solved_at: $solvedAt }) {
      affected_rows
    }
  }
`

export default IssueAdminCard
