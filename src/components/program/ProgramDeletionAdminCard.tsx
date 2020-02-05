import { Button, Typography } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { InferType } from 'yup'
import { commonMessages } from '../../helpers/translation'
import { programSchema } from '../../schemas/program'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  deleteProgram: { id: 'program.label.deleteProgram', defaultMessage: '刪除課程' },
  deleteProgramWarning: {
    id: 'program.text.deleteProgramWarning',
    defaultMessage: '請仔細確認是否真的要刪除課程，因為一旦刪除就無法恢復。',
  },
  deleteProgramDanger: {
    id: 'program.text.deleteProgramDanger',
    defaultMessage: '注意：只有在無人購買的情況下才能刪除課程。',
  },
})

type ProgramDeletionAdminCardProps = {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramDeletionAdminCard: React.FC<ProgramDeletionAdminCardProps> = ({ program }) => {
  const { formatMessage } = useIntl()

  return (
    <AdminCard loading={!program}>
      <Typography.Title level={4}>{formatMessage(messages.deleteProgram)}</Typography.Title>
      <Typography.Text>{formatMessage(messages.deleteProgramWarning)}</Typography.Text>
      <Typography.Text type="danger">{formatMessage(messages.deleteProgramDanger)}</Typography.Text>
      <Button type="danger" disabled>
        {formatMessage(commonMessages.ui.delete)}
      </Button>
    </AdminCard>
  )
}

export default ProgramDeletionAdminCard
