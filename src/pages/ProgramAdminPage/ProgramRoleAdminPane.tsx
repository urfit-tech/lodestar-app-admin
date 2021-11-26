import { PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { StyledAdminBlock, StyledAdminBlockTitle } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import RoleAdminBlock from '../../components/admin/RoleAdminBlock'
import MemberAvatar from '../../components/common/MemberAvatar'
import ContentCreatorSelector from '../../components/form/ContentCreatorSelector'
import hasura from '../../hasura'
import { handleError, notEmpty } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'

const ProgramRoleAdminPane: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateProgramRole] = useMutation<hasura.UPDATE_PROGRAM_ROLE, hasura.UPDATE_PROGRAM_ROLEVariables>(
    UPDATE_PROGRAM_ROLE,
  )
  const [deleteProgramRole] = useMutation<hasura.DELETE_PROGRAM_ROLE, hasura.DELETE_PROGRAM_ROLEVariables>(
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
        setSelectedMemberId(null)
        onSuccess()
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      <StyledAdminBlock>
        <StyledAdminBlockTitle>{formatMessage(programMessages.label.programOwner)}</StyledAdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'owner')
          .map(role => (
            <MemberAvatar key={role.id} size="32px" memberId={role.member?.id || ''} withName />
          ))}
      </StyledAdminBlock>

      <StyledAdminBlock>
        <StyledAdminBlockTitle>{formatMessage(commonMessages.label.instructor)}</StyledAdminBlockTitle>
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
                  .then(() => onRefetch?.())
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
          <Form layout="vertical" colon={false} hideRequiredMark>
            <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
              <ContentCreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
            </Form.Item>
          </Form>
        </AdminModal>
      </StyledAdminBlock>

      <StyledAdminBlock>
        <StyledAdminBlockTitle>{formatMessage(commonMessages.label.teachingAssistant)}</StyledAdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'assistant')
          .map(role => (
            <MemberAvatar key={role.id} size="32px" memberId={role.member?.id || ''} withName />
          ))}
      </StyledAdminBlock>
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
