import { useMutation } from '@apollo/react-hooks'
import { Button, message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'

const messages = defineMessages({
  deleteProgramConfirmation: {
    id: 'program.text.deleteProgramConfirmation',
    defaultMessage: '課程一經刪除即不可恢復，確定要刪除嗎？',
  },
  deleteProgramWarning: {
    id: 'program.text.deleteProgramWarning',
    defaultMessage: '請仔細確認是否真的要刪除課程，因為一旦刪除就無法恢復。',
  },
  deleteProgramDanger: {
    id: 'program.text.deleteProgramDanger',
    defaultMessage: '*已購買者在刪除後仍可觀看。',
  },
})

const StyledText = styled.div`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
`

const ProgramDeletionAdminCard: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [archiveProgram] = useMutation<hasura.UPDATE_PROGRAM_IS_DELETED, hasura.UPDATE_PROGRAM_IS_DELETEDVariables>(
    UPDATE_PROGRAM_IS_DELETED,
  )
  if (!program) {
    return <Skeleton active />
  }

  const handleArchive = (programId: string) => {
    archiveProgram({
      variables: { programId },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
        history.push(`/programs`)
      })
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <div className="mb-2">{formatMessage(messages.deleteProgramWarning)}</div>
        <StyledText>{formatMessage(messages.deleteProgramDanger)}</StyledText>
      </div>

      <AdminModal
        title={formatMessage(commonMessages.ui.deleteProgram)}
        renderTrigger={({ setVisible }) =>
          program.isDeleted ? (
            <Button disabled>{formatMessage(commonMessages.status.deleted)}</Button>
          ) : (
            <Button type="primary" danger onClick={() => setVisible(true)}>
              {formatMessage(commonMessages.ui.deleteProgram)}
            </Button>
          )
        }
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => handleArchive(program.id)}
      >
        <div>{formatMessage(messages.deleteProgramConfirmation)}</div>
      </AdminModal>
    </div>
  )
}

const UPDATE_PROGRAM_IS_DELETED = gql`
  mutation UPDATE_PROGRAM_IS_DELETED($programId: uuid) {
    update_program(where: { id: { _eq: $programId } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

export default ProgramDeletionAdminCard
