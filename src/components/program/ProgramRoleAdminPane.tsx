import { PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError, notEmpty } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramAdminProps } from '../../types/program'
import { AdminBlock, AdminBlockTitle } from '../admin'
import AdminModal from '../admin/AdminModal'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import MemberAvatar from '../common/MemberAvatar'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const ProgramRoleAdminPane: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateProgramRole] = useMutation<types.UPDATE_PROGRAM_ROLE, types.UPDATE_PROGRAM_ROLEVariables>(
    UPDATE_PROGRAM_ROLE,
  )
  const [deleteProgramRole] = useMutation<types.DELETE_PROGRAM_ROLE, types.DELETE_PROGRAM_ROLEVariables>(
    DELETE_PROGRAM_ROLE,
  )

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!program) {
    return <Skeleton active />
  }

  const handleSubmit = (onSuccess: () => void) => {
    if (!selectedMemberId) {
      return
    }
    setLoading(true)
    updateProgramRole({
      variables: {
        programId: program.id,
        programRoles: [
          ...program.roles
            .filter(role => notEmpty(role.member?.id))
            .map(role => ({ memberId: role.member?.id || '', name: role.name || '' })),
          { memberId: selectedMemberId, name: 'instructor' },
        ].map(instructorId => ({
          program_id: program.id,
          member_id: instructorId.memberId,
          name: instructorId.name,
        })),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        setSelectedMemberId(null)
        onSuccess()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      <AdminBlock>
        <AdminBlockTitle>{formatMessage(programMessages.label.programOwner)}</AdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'owner')
          .map(role => (
            <MemberAvatar key={role.id} size="32px" memberId={role.member?.id || ''} withName />
          ))}
      </AdminBlock>

      <AdminBlock>
        <AdminBlockTitle>{formatMessage(commonMessages.term.instructor)}</AdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'instructor')
          .map(role => (
            <RoleAdminBlock
              key={role.id}
              name={role.member?.name || ''}
              pictureUrl={role.member?.pictureUrl || ''}
              onDelete={() =>
                deleteProgramRole({
                  variables: {
                    programId: program.id,
                  },
                })
                  .then(() => onRefetch && onRefetch())
                  .catch(handleError)
              }
            />
          ))}

        <AdminModal
          renderTrigger={({ setVisible }) =>
            !program.roles.find(role => role.name === 'instructor') ? (
              <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
                {formatMessage(commonMessages.ui.addInstructor)}
              </Button>
            ) : null
          }
          title={formatMessage(commonMessages.ui.addInstructor)}
          footer={null}
          renderFooter={({ setVisible }) => (
            <>
              <Button className="mr-2" onClick={() => setVisible(false)}>
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
                {formatMessage(commonMessages.ui.add)}
              </Button>
            </>
          )}
        >
          <Form form={form} layout="vertical" colon={false} hideRequiredMark>
            <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
              <ContentCreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
            </Form.Item>
          </Form>
        </AdminModal>
      </AdminBlock>

      <AdminBlock>
        <AdminBlockTitle>{formatMessage(commonMessages.term.teachingAssistant)}</AdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'assistant')
          .map(role => (
            <MemberAvatar key={role.id} size="32px" memberId={role.member?.id || ''} withName />
          ))}
      </AdminBlock>
    </>
  )
}

const UPDATE_PROGRAM_ROLE = gql`
  mutation UPDATE_PROGRAM_ROLE($programId: uuid!, $programRoles: [program_role_insert_input!]!) {
    delete_program_role(where: { program_id: { _eq: $programId } }) {
      affected_rows
    }
    insert_program_role(objects: $programRoles) {
      affected_rows
    }
  }
`
const DELETE_PROGRAM_ROLE = gql`
  mutation DELETE_PROGRAM_ROLE($programId: uuid!) {
    delete_program_role(where: { program_id: { _eq: $programId }, name: { _eq: "instructor" } }) {
      affected_rows
    }
  }
`

export default ProgramRoleAdminPane
