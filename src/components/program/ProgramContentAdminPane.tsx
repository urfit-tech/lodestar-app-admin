import { Button, Divider, Spin, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { InferType } from 'yup'
import { programSchema } from '../../schemas/program'
import ProgramContentSectionAdminCard from './ProgramContentSectionAdminCard'
import ProgramStructureAdminModal from './ProgramStructureAdminModal'

const ProgramContentAdminPane: React.FC<{
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const [loading, setLoading] = useState()
  const createProgramContentSection = useMutation(INSERT_PROGRAM_CONTENT_SECTION)
  const handleContentSectionAdd = () => {
    if (program) {
      setLoading(true)
      createProgramContentSection({
        variables: {
          programId: program.id,
          title: '未命名區塊',
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
          課程內容
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
            新增區塊中
          </Button>
        ) : (
          <Button type="link" icon="plus" onClick={handleContentSectionAdd}>
            新增區塊
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
