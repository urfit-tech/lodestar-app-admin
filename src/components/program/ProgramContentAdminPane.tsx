import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Spin, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramProps } from '../../types/program'
import ProgramContentSectionAdminCard from './ProgramContentSectionAdminCard'
import ProgramStructureAdminModal from './ProgramStructureAdminModal'

const messages = defineMessages({
  creatingBlock: { id: 'program.event.creatingBlock', defaultMessage: '新增區塊中' },
  createBlock: { id: 'program.ui.createBlock', defaultMessage: '新增區塊' },
})

const ProgramContentAdminPane: React.FC<{
  program: ProgramProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [createProgramContentSection] = useMutation<
    types.INSERT_PROGRAM_CONTENT_SECTION,
    types.INSERT_PROGRAM_CONTENT_SECTIONVariables
  >(INSERT_PROGRAM_CONTENT_SECTION)

  const [loading, setLoading] = useState(false)

  const handleContentSectionAdd = () => {
    if (program) {
      setLoading(true)
      createProgramContentSection({
        variables: {
          programId: program.id,
          title: 'Untitled Block',
          position: program.contentSections.length,
        },
      })
        .then(() => onRefetch && onRefetch())
        .finally(() => setLoading(false))
    }
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <Typography.Title className="mb-0" level={3}>
          {formatMessage(programMessages.label.programContent)}
        </Typography.Title>
        <ProgramStructureAdminModal program={program} onStructureChange={onRefetch} />
      </div>

      {program ? (
        program.contentSections.map(programContentSection => (
          <div className="mb-3" key={programContentSection.id}>
            <ProgramContentSectionAdminCard
              program={program}
              programContentSection={programContentSection}
              onRefetch={onRefetch}
              onDelete={() => onRefetch && onRefetch()}
              onUpdate={() => onRefetch && onRefetch()}
            />
          </div>
        ))
      ) : (
        <Spin />
      )}

      <Divider>
        {loading ? (
          <Button type="link" icon="loading">
            {formatMessage(messages.creatingBlock)}
          </Button>
        ) : (
          <Button type="link" icon="plus" onClick={handleContentSectionAdd}>
            {formatMessage(messages.createBlock)}
          </Button>
        )}
      </Divider>
    </div>
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

export default ProgramContentAdminPane
