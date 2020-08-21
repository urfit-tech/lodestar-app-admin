import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import types from '../../types'
import { ProgramAdminProps } from '../../types/program'
import ProgramContentSectionAdminCard from './ProgramContentSectionAdminCard'

const messages = defineMessages({
  creatingBlock: { id: 'program.event.creatingBlock', defaultMessage: '新增區塊中' },
  createBlock: { id: 'program.ui.createBlock', defaultMessage: '新增區塊' },
})

const ProgramStructureAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [createProgramContentSection] = useMutation<
    types.INSERT_PROGRAM_CONTENT_SECTION,
    types.INSERT_PROGRAM_CONTENT_SECTIONVariables
  >(INSERT_PROGRAM_CONTENT_SECTION)
  const [loading, setLoading] = useState(false)

  if (!program) {
    return <Skeleton active />
  }

  const handleContentSectionAdd = () => {
    setLoading(true)
    createProgramContentSection({
      variables: {
        programId: program.id,
        title: 'Untitled Block',
        position: program.contentSections.length,
      },
    })
      .then(() => onRefetch && onRefetch())
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      {program.contentSections.map(programContentSection => (
        <div key={programContentSection.id} className="mb-3">
          <ProgramContentSectionAdminCard
            program={program}
            programContentSection={programContentSection}
            onRefetch={onRefetch}
          />
        </div>
      ))}

      <Divider>
        <Button
          type="link"
          icon={loading ? <LoadingOutlined /> : <PlusOutlined />}
          loading={loading}
          onClick={handleContentSectionAdd}
        >
          {formatMessage(messages.createBlock)}
        </Button>
      </Divider>
    </>
  )
}

const INSERT_PROGRAM_CONTENT_SECTION = gql`
  mutation INSERT_PROGRAM_CONTENT_SECTION($programId: uuid!, $title: String!, $position: Int!) {
    insert_program_content_section(objects: { program_id: $programId, title: $title, position: $position }) {
      returning {
        id
      }
    }
  }
`

export default ProgramStructureAdminBlock
