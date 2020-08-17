import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Modal } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { programMessages } from '../../helpers/translation'
import { useProgram } from '../../hooks/program'
import types from '../../types'
import AdminCard from '../admin/AdminCard'
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

const messages = defineMessages({
  checkProgramContent: { id: 'program.ui.checkProgramContent', defaultMessage: '查看課程內容' },
})

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
  solvedAt: Date | null
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
  const { formatMessage } = useIntl()
  const { settings } = useContext(AppContext)
  const { currentMemberId, currentUserRole } = useAuth()
  const { program } = useProgram(programId)
  const [updateIssueStatus] = useMutation<types.UPDATE_ISSUE_STATUS, types.UPDATE_ISSUE_STATUSVariables>(
    UPDATE_ISSUE_STATUS,
  )

  const [solved, setSolved] = useState(!!solvedAt)
  const [isModalVisible, setModalVisible] = useState<boolean>(false)

  const programRoles = (program && program.roles) || []
  const programTitle = program?.title

  return (
    <>
      <StyledAdminCard className="mb-3" {...cardProps}>
        <IssueItem
          showSolvedCheckbox
          programRoles={program?.roles || []}
          issueId={issueId}
          title={title}
          description={description}
          reactedMemberIds={reactedMemberIds}
          numReplies={numReplies}
          createdAt={createdAt}
          memberId={memberId}
          solvedAt={solvedAt}
          onRefetch={onRefetch}
        />

        <div className="mask" onClick={() => setModalVisible(true)} />

        {currentMemberId === memberId ||
        currentUserRole === 'app-owner' ||
        programRoles
          .filter(role => role?.member?.id === currentMemberId)
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
            {solvedAt
              ? formatMessage(programMessages.status.issueSolved)
              : formatMessage(programMessages.status.issueOpen)}
          </StyledCheckbox>
        ) : null}
      </StyledAdminCard>

      <Modal
        footer={null}
        visible={isModalVisible}
        onCancel={() => setModalVisible(false)}
        title={
          <>
            <span>{programTitle}</span>
            <Button type="link" onClick={() => window.open(`//${settings['host']}${threadId}`)}>
              {formatMessage(messages.checkProgramContent)}
            </Button>
          </>
        }
      >
        <IssueItem
          defaultRepliesVisible
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
