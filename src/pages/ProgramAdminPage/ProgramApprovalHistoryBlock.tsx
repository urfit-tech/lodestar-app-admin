import Icon from '@ant-design/icons'
import { Skeleton, Timeline } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { ReactComponent as ExclamationCircle } from '../../images/icon/exclamation-circle.svg'
import { ProgramAdminProps, ProgramApprovalProps } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
`
const StyledDescription = styled.div`
  margin-bottom: 1.25rem;
  color: var(--gray-darker);
  white-space: pre-line;
`
const StyledFeedback = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  border-radius: 4px;
  background-color: var(--gray-lighter);
  color: var(--gray-darker);
  font-size: 14px;
  white-space: pre-line;
`
const StyledFeedbackTitle = styled.div`
  font-size: 16px;
`
const StyledTag = styled.span<{ variant?: ProgramApprovalProps['status'] }>`
  padding: 2px 0.5rem;
  background: ${props =>
    props.variant === 'pending'
      ? 'var(--warning)'
      : props.variant === 'canceled'
      ? 'var(--gray);'
      : props.variant === 'rejected'
      ? 'var(--error);'
      : props.variant === 'approved'
      ? 'var(--success);'
      : ''};
  color: white;
  font-size: 12px;
  border-radius: 12px;
`
const StyledDate = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
`

const ProgramApprovalHistoryBlock: React.FC<{
  program: ProgramAdminProps | null
}> = ({ program }) => {
  const { formatMessage } = useIntl()

  if (!program) {
    return <Skeleton />
  }

  return (
    <Timeline>
      {program.approvals.map(approval => (
        <Timeline.Item key={approval.id} color="#cdcdcd">
          <StyledTitle className="d-flex align-items-center">
            <span className="mr-2">
              {formatMessage(ProgramAdminPageMessages.ProgramApprovalHistory.sentApproval, {
                date: moment(approval.createdAt).format('YYYY-MM-DD HH:mm'),
              })}
            </span>
            <StyledTag variant={approval.status}>
              {approval.status === 'pending'
                ? formatMessage(ProgramAdminPageMessages['*'].pendingApproval)
                : approval.status === 'canceled'
                ? formatMessage(ProgramAdminPageMessages.ProgramApprovalHistory.canceledApproval)
                : approval.status === 'rejected'
                ? formatMessage(ProgramAdminPageMessages['*'].rejectedApproval)
                : approval.status === 'approved'
                ? formatMessage(ProgramAdminPageMessages.ProgramApprovalHistory.approvedApproval)
                : null}
            </StyledTag>
          </StyledTitle>

          {approval.description && <StyledDescription>{approval.description}</StyledDescription>}
          {approval.feedback && (
            <StyledFeedback>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <StyledFeedbackTitle>
                  <Icon component={() => <ExclamationCircle />} className="mr-2" />
                  <span>{formatMessage(ProgramAdminPageMessages.ProgramApprovalHistory.advisement)}</span>
                </StyledFeedbackTitle>
                <StyledDate>{moment(approval.updatedAt).format('YYYY-MM-DD HH:mm')}</StyledDate>
              </div>
              <div>{approval.feedback}</div>
            </StyledFeedback>
          )}
        </Timeline.Item>
      ))}
    </Timeline>
  )
}

export default ProgramApprovalHistoryBlock
