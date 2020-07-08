import { useMutation } from '@apollo/react-hooks'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React from 'react'
import ProgramRoleAdminPaneComponent from '../../components/program/ProgramRoleAdminPane'
import types from '../../types'
import { ProgramProps } from '../../types/program'

export type UpdateProgramProps = (props: {
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    programId: string
    instructorIds: {
      memberId: string
      name: string
    }[]
  }
}) => void

export type DeleteProgramProps = (props: {
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    programId: string
  }
}) => void

const ProgramRoleAdminPane: React.FC<
  CardProps & {
    program: ProgramProps | null
    onRefetch?: () => void
  }
> = ({ program, onRefetch }) => {
  const [updateProgramRole] = useMutation<types.UPDATE_PROGRAM_ROLE, types.UPDATE_PROGRAM_ROLEVariables>(
    UPDATE_PROGRAM_ROLE,
  )
  const [deleteProgramRole] = useMutation<types.DELETE_PROGRAM_ROLE, types.DELETE_PROGRAM_ROLEVariables>(
    DELETE_PROGRAM_ROLE,
  )

  const handleUpdateProgram: UpdateProgramProps = ({ onSuccess, onError, onFinally, data }) => {
    updateProgramRole({
      variables: {
        programId: data.programId,
        programRoles: data.instructorIds.map(instructorId => ({
          program_id: data.programId,
          member_id: instructorId.memberId,
          name: instructorId.name,
        })),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }
  const handleDeleteProgram: DeleteProgramProps = ({ onSuccess, onError, onFinally, data }) => {
    deleteProgramRole({
      variables: {
        programId: data.programId,
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }
  return (
    <ProgramRoleAdminPaneComponent
      program={program}
      onProgramUpdate={handleUpdateProgram}
      onProgramDelete={handleDeleteProgram}
    />
  )
}

export default ProgramRoleAdminPane

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
