import Icon from '@ant-design/icons'
import { Skeleton, Timeline } from 'antd'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { ReactComponent as ExclamationCircle } from '../../images/icon/exclamation-circle.svg'
import { ProgramAdminProps, ProgramApprovalProps } from '../../types/program'

const messages = defineMessages({
  sentApproval: { id: 'program.label.sentApproval', defaultMessage: '{date} 送審' },
  advisement: { id: 'program.label.advisement', defaultMessage: '官方建議' },
  canceledApproval: { id: 'program.status.canceledApproval', defaultMessage: '取消送審' },
  rejectedApproval: { id: 'program.status.rejectedApproval', defaultMessage: '審核失敗' },
  approvedApproval: { id: 'program.status.approvedApproval', defaultMessage: '審核通過' },
})

const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
`
const StyledDescription = styled.div`
  margin-bottom: 1.25rem;
  color: var(--gray-darker);
`
const StyledFeedback = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  border-radius: 4px;
  background-color: var(--gray-lighter);
  color: var(--gray-darker);
  font-size: 14px;
`
const StyledFeedbackTitle = styled.div`
  margin-bottom: 1.25rem;
  font-size: 16px;
`
const StyledTag = styled.span<{ variant?: ProgramApprovalProps['status'] }>`
  padding: 2px 0.5rem;
  background: ${props =>
    props.variant === 'canceled'
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
          <StyledTitle className="d-flex align-items-center mr-2">
            <span className="mr-2">
              {formatMessage(messages.sentApproval, {
                date: moment(approval.createdAt).format('YYYY-MM-DD HH:mm'),
              })}
            </span>
            <StyledTag variant={approval.status}>
              {approval.status === 'canceled'
                ? formatMessage(messages.canceledApproval)
                : approval.status === 'rejected'
                ? formatMessage(messages.rejectedApproval)
                : approval.status === 'approved'
                ? formatMessage(messages.approvedApproval)
                : null}
            </StyledTag>
          </StyledTitle>

          {approval.description && <StyledDescription>{approval.description}</StyledDescription>}
          {approval.feedback && (
            <StyledFeedback>
              <StyledFeedbackTitle>
                <Icon component={() => <ExclamationCircle />} className="mr-2" />
                <span>{formatMessage(messages.advisement)}</span>
              </StyledFeedbackTitle>
              <div>{approval.feedback}</div>
            </StyledFeedback>
          )}
        </Timeline.Item>
      ))}
    </Timeline>
  )
}

export default ProgramApprovalHistoryBlock
