import { PlusOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, Skeleton } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import RoleAdminBlock from '../../components/admin/RoleAdminBlock'
import MemberAvatar from '../../components/common/MemberAvatar'
import ContentCreatorSelector from '../../components/form/ContentCreatorSelector'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { ProgramAdminProps } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const ProgramRoleAdminPane: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [insertProgramRole] = useMutation<hasura.INSERT_PROGRAM_ROLE, hasura.INSERT_PROGRAM_ROLEVariables>(
    INSERT_PROGRAM_ROLE,
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
    insertProgramRole({
      variables: {
        programRole: [
          {
            program_id: program.id,
            member_id: selectedMemberId,
            name: 'instructor',
          },
        ],
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
      <AdminBlock>
        <AdminBlockTitle>{formatMessage(ProgramAdminPageMessages.ProgramRoleAdminPane.programOwner)}</AdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'owner')
          .map(role => (
            <MemberAvatar key={role.id} size="32px" memberId={role.member?.id || ''} withName />
          ))}
      </AdminBlock>

      <AdminBlock>
        <AdminBlockTitle>{formatMessage(ProgramAdminPageMessages.ProgramRoleAdminPane.instructor)}</AdminBlockTitle>
        {program.roles
          .filter(role => role.name === 'instructor')
          .map((role, _, arr) => (
            <RoleAdminBlock
              key={role.id}
              name={role.member?.name || ''}
              pictureUrl={role.member?.pictureUrl || ''}
              onDelete={
                arr.length === 1
                  ? undefined
                  : () => {
                      deleteProgramRole({
                        variables: {
                          programId: program.id,
                          roleId: role.id,
                        },
                      })
                        .then(() => onRefetch?.())
                        .catch(handleError)
                    }
              }
            />
          ))}

        <AdminModal
          renderTrigger={({ setVisible }) => (
            <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
              {formatMessage(ProgramAdminPageMessages.ProgramRoleAdminPane.addInstructor)}
            </Button>
          )}
          title={formatMessage(ProgramAdminPageMessages.ProgramRoleAdminPane.addInstructor)}
          footer={null}
          renderFooter={({ setVisible }) => (
            <>
              <Button className="mr-2" onClick={() => setVisible(false)}>
                {formatMessage(ProgramAdminPageMessages['*'].cancel)}
              </Button>
              <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
                {formatMessage(ProgramAdminPageMessages.ProgramRoleAdminPane.add)}
              </Button>
            </>
          )}
        >
          <Form layout="vertical" colon={false} hideRequiredMark>
            <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramRoleAdminPane.selectInstructor)}>
              <ContentCreatorSelector
                value={selectedMemberId || ''}
                onChange={value => setSelectedMemberId(value)}
                allowedPermissions={['PROGRAM_ADMIN', 'PROGRAM_NORMAL']}
              />
            </Form.Item>
          </Form>
        </AdminModal>
      </AdminBlock>
    </>
  )
}

const INSERT_PROGRAM_ROLE = gql`
  mutation INSERT_PROGRAM_ROLE($programRole: [program_role_insert_input!]!) {
    insert_program_role(objects: $programRole) {
      affected_rows
    }
  }
`
const DELETE_PROGRAM_ROLE = gql`
  mutation DELETE_PROGRAM_ROLE($programId: uuid!, $roleId: uuid!) {
    delete_program_role(where: { id: { _eq: $roleId }, program_id: { _eq: $programId }, name: { _eq: "instructor" } }) {
      affected_rows
    }
  }
`

export default ProgramRoleAdminPane
