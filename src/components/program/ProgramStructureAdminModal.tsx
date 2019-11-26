import { useMutation } from '@apollo/react-hooks'
import { Button } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import Sortable from 'react-sortablejs'
import { InferType } from 'yup'
import { programContentSectionSchema, programSchema } from '../../schemas/program'
import types from '../../types'
import AdminModal from '../common/AdminModal'
import DraggableItem from '../common/DraggableItem'

type ProgramStructureAdminModalProps = {
  program: InferType<typeof programSchema> | null
  onStructureChange?: () => void
}
const ProgramStructureAdminModal: React.FC<ProgramStructureAdminModalProps> = ({ program, onStructureChange }) => {
  const [updateProgramContentSections] = useMutation<
    types.UPSERT_PROGRAM_CONTENT_SECTIONS,
    types.UPSERT_PROGRAM_CONTENT_SECTIONSVariables
  >(UPSERT_PROGRAM_CONTENT_SECTIONS)
  const [updateProgramContents] = useMutation<types.UPSERT_PROGRAM_CONTENTS, types.UPSERT_PROGRAM_CONTENTSVariables>(
    UPSERT_PROGRAM_CONTENTS,
  )

  const [loading, setLoading] = useState(false)
  const [sections, setSections] = useState<InferType<typeof programContentSectionSchema>[]>([])

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
            title: section.title,
            position: idx,
          })),
        },
      }),
      updateProgramContents({
        variables: {
          programContents: sections.flatMap(section =>
            section.programContents.map((content, idx) => ({
              id: content.id,
              title: content.title,
              position: idx,
              content_section_id: section.id,
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
        <Button type="link" icon="drag" onClick={() => setVisible(true)}>
          課程排序
        </Button>
      )}
      title="內容排序"
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            確定
          </Button>
        </>
      )}
    >
      <Sortable
        options={{ handle: '.draggable-section' }}
        onChange={(sectionStrings: string[]) =>
          setSections(sectionStrings.map(sectionString => JSON.parse(sectionString)))
        }
      >
        {sections.map((section, idx) => (
          <div key={section.id} data-id={JSON.stringify(section)}>
            <Button type="link" icon="drag" className="draggable-section">
              {section.title}
            </Button>
            <Sortable
              options={{ group: 'shared', handle: '.draggable-content' }}
              onChange={(programContentStrings: string[]) => {
                setSections([
                  ...sections.slice(0, idx),
                  {
                    ...section,
                    programContents: programContentStrings.map(programContentString =>
                      JSON.parse(programContentString),
                    ),
                  },
                  ...sections.slice(idx + 1),
                ])
              }}
            >
              {section.programContents.map(programContent => (
                <DraggableItem
                  key={programContent.id}
                  className="mb-1"
                  dataId={JSON.stringify(programContent)}
                  handlerClassName="draggable-content"
                >
                  {programContent.title}
                </DraggableItem>
              ))}
            </Sortable>
          </div>
        ))}
      </Sortable>
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
