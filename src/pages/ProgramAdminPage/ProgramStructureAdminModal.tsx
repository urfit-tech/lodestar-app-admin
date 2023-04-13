import { DragOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button } from 'antd'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import AdminModal from '../../components/admin/AdminModal'
import DraggableItem from '../../components/common/DraggableItem'
import hasura from '../../hasura'
import { ProgramAdminProps, ProgramContentSectionProps } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledDraggableSectionLabel = styled.div`
  color: ${props => props.theme['@primary-color']};
`

const ProgramStructureAdminModal: React.FC<{
  program: ProgramAdminProps | null
  onStructureChange?: () => void
}> = ({ program, onStructureChange }) => {
  const { formatMessage } = useIntl()

  const [updateProgramContentSections] = useMutation<
    hasura.UPSERT_PROGRAM_CONTENT_SECTIONS,
    hasura.UPSERT_PROGRAM_CONTENT_SECTIONSVariables
  >(UPSERT_PROGRAM_CONTENT_SECTIONS)
  const [updateProgramContents] = useMutation<hasura.UPSERT_PROGRAM_CONTENTS, hasura.UPSERT_PROGRAM_CONTENTSVariables>(
    UPSERT_PROGRAM_CONTENTS,
  )

  const [loading, setLoading] = useState(false)
  const [sections, setSections] = useState<ProgramContentSectionProps[]>([])

  useEffect(() => {
    if (program) {
      setSections(program.contentSections)
    }
  }, [program])

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!program) {
      return
    }

    setLoading(true)

    Promise.all([
      updateProgramContentSections({
        variables: {
          programContentSections: sections.map((section, idx) => ({
            id: section.id,
            program_id: program.id,
            title: section.title || '',
            position: idx,
          })),
        },
      }),
      updateProgramContents({
        variables: {
          programContents: sections.flatMap(section =>
            section.programContents.map((content, idx) => ({
              id: content.id,
              title: content.title || '',
              position: idx,
              content_section_id: section.id,
              display_mode: content.displayMode,
            })),
          ),
        },
      }),
    ])
      .then(() => {
        onStructureChange && onStructureChange()
        setVisible(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="link" icon={<DragOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(ProgramAdminPageMessages.ProgramStructureAdminModal.contentSorting)}
        </Button>
      )}
      title={formatMessage(ProgramAdminPageMessages.ProgramStructureAdminModal.contentSorting)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(ProgramAdminPageMessages['*'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(ProgramAdminPageMessages['*'].confirm)}
          </Button>
        </>
      )}
    >
      <ReactSortable
        handle=".draggable-section"
        list={sections}
        setList={newSections => {
          setSections(newSections)
        }}
      >
        {sections.map((section, index) => (
          <div key={section.id} className="mb-3">
            <StyledDraggableSectionLabel className="draggable-section cursor-pointer mb-2">
              <DragOutlined className="mr-2" />
              <span>{section.title}</span>
            </StyledDraggableSectionLabel>
            <ReactSortable
              handle=".draggable-content"
              list={section.programContents}
              setList={newProgramContents => {
                setSections([
                  ...sections.slice(0, index),
                  {
                    ...section,
                    programContents: newProgramContents,
                  },
                  ...sections.slice(index + 1),
                ])
              }}
            >
              {section.programContents.map(programContent => (
                <DraggableItem
                  key={programContent.id}
                  className="mb-1"
                  dataId={programContent.id}
                  handlerClassName="draggable-content"
                >
                  {programContent.title}
                </DraggableItem>
              ))}
            </ReactSortable>
          </div>
        ))}
      </ReactSortable>
    </AdminModal>
  )
}

const UPSERT_PROGRAM_CONTENT_SECTIONS = gql`
  mutation UPSERT_PROGRAM_CONTENT_SECTIONS($programContentSections: [program_content_section_insert_input!]!) {
    insert_program_content_section(
      objects: $programContentSections
      on_conflict: { constraint: program_content_section_pkey, update_columns: [position] }
    ) {
      affected_rows
    }
  }
`
const UPSERT_PROGRAM_CONTENTS = gql`
  mutation UPSERT_PROGRAM_CONTENTS($programContents: [program_content_insert_input!]!) {
    insert_program_content(
      objects: $programContents
      on_conflict: { constraint: program_content_pkey, update_columns: [content_section_id, position] }
    ) {
      affected_rows
    }
  }
`
export default ProgramStructureAdminModal
