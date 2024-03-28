import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Divider, Skeleton } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ProgramContentSectionAdminCard from '../../components/program/ProgramContentSectionAdminCard'
import { handleError } from '../../helpers'
import { ProgramAdminProps } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const ProgramStructureAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [createProgramContentSection] = useMutation(INSERT_PROGRAM_CONTENT_SECTION)
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
        collapsedStatus: program.contentSections.length === 0 ? true : false,
      },
    })
      .then(() => onRefetch?.())
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      {program.contentSections.map(programContentSection => (
        <div key={programContentSection.id} className="mb-3">
          <ProgramContentSectionAdminCard
            programId={program.id}
            isProgramPublished={!!program?.publishedAt}
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
          {formatMessage(ProgramAdminPageMessages.ProgramStructureAdminBlock.createBlock)}
        </Button>
      </Divider>
    </>
  )
}

const INSERT_PROGRAM_CONTENT_SECTION = gql`
  mutation INSERT_PROGRAM_CONTENT_SECTION(
    $programId: uuid!
    $title: String!
    $position: Int!
    $collapsedStatus: Boolean
  ) {
    insert_program_content_section(
      objects: { program_id: $programId, title: $title, position: $position, collapsed_status: $collapsedStatus }
    ) {
      returning {
        id
      }
    }
  }
`

export default ProgramStructureAdminBlock
