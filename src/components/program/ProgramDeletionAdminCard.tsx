import { Button, Typography } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { ProgramType } from '../../types/program'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  deleteProgram: { id: 'program.label.deleteProgram', defaultMessage: '刪除課程' },
  deleteProgramWarning: {
    id: 'program.text.deleteProgramWarning',
    defaultMessage: '請仔細確認是否真的要刪除課程，因為一旦刪除就無法恢復。',
  },
  deleteProgramDanger: {
    id: 'program.text.deleteProgramDanger',
    defaultMessage: '*已購買者在刪除後仍可觀看。',
  },
})

const StyledText = styled.span`
  color: ${props => props.theme['@primary-color']};
`

type ProgramDeletionAdminCardProps = {
  program: ProgramType | null
  onRefetch?: () => void
}
const ProgramDeletionAdminCard: React.FC<ProgramDeletionAdminCardProps> = ({ program }) => {
  const { formatMessage } = useIntl()

  return (
    <AdminCard loading={!program}>
      <Typography.Title level={4} className="mb-4">
        {formatMessage(messages.deleteProgram)}
      </Typography.Title>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex flex-column">
          <Typography.Text>{formatMessage(messages.deleteProgramWarning)}</Typography.Text>
          <StyledText>{formatMessage(messages.deleteProgramDanger)}</StyledText>
        </div>
        <Button type="primary">{formatMessage(commonMessages.ui.delete)}</Button>
      </div>
    </AdminCard>
  )
}

export default ProgramDeletionAdminCard
