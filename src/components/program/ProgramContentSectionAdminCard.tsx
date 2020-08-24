import { MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Menu, Typography } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import types from '../../types'
import { ProgramAdminProps, ProgramContentSectionProps } from '../../types/program'
import { AdminBlock } from '../admin'
import ProgramContentAdminItem from './ProgramContentAdminItem'

const messages = defineMessages({
  deleteSectionWarning: {
    id: 'program.text.deleteSectionWarning',
    defaultMessage: '此區塊內的所有內容將被刪除，此動作無法還原',
  },
  deleteSection: { id: 'program.ui.deleteSection', defaultMessage: '刪除區塊' },
  createContent: { id: 'program.ui.createContent', defaultMessage: '新增內容' },
})

const ProgramContentSectionAdminCard: React.FC<{
  program: ProgramAdminProps
  programContentSection: ProgramContentSectionProps
  onRefetch?: () => void
}> = ({ program, programContentSection, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [createProgramContent] = useMutation<types.INSERT_PROGRAM_CONTENT, types.INSERT_PROGRAM_CONTENTVariables>(
    INSERT_PROGRAM_CONTENT,
  )
  const [updateProgramContentSection] = useMutation<
    types.UPDATE_PROGRAM_CONTENT_SECTION,
    types.UPDATE_PROGRAM_CONTENT_SECTIONVariables
  >(UPDATE_PROGRAM_CONTENT_SECTION)
  const [deleteProgramContentSection] = useMutation<
    types.DELETE_PROGRAM_CONTENT_SECTION,
    types.DELETE_PROGRAM_CONTENT_SECTIONVariables
  >(DELETE_PROGRAM_CONTENT_SECTION)

  return (
    <AdminBlock>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Typography.Title
          className="flex-grow-1 m-0"
          level={4}
          editable={{
            onChange: title => {
              updateProgramContentSection({
                variables: { id: programContentSection.id, title },
              })
                .then(() => onRefetch && onRefetch())
                .catch(handleError)
            },
          }}
        >
          {programContentSection.title}
        </Typography.Title>

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item
                onClick={() =>
                  window.confirm(formatMessage(messages.deleteSectionWarning)) &&
                  deleteProgramContentSection({
                    variables: { programContentSectionId: programContentSection.id },
                  })
                    .then(() => onRefetch && onRefetch())
                    .catch(handleError)
                }
              >
                {formatMessage(messages.deleteSection)}
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined />
        </Dropdown>
      </div>

      {programContentSection.programContents.map(programContent => (
        <div key={programContent.id} className="mb-2">
          <ProgramContentAdminItem
            program={program}
            programContent={programContent}
            showPlans={program && program.isSubscription}
            onRefetch={onRefetch}
          />
        </div>
      ))}

      <Button
        type="link"
        icon={<PlusOutlined />}
        onClick={() =>
          createProgramContent({
            variables: {
              programContentSectionId: programContentSection.id,
              title: 'untitled',
              position: programContentSection.programContents.length,
              publishedAt: program && program.publishedAt ? undefined : new Date(),
            },
          })
            .then(() => onRefetch && onRefetch())
            .catch(handleError)
        }
      >
        {formatMessage(messages.createContent)}
      </Button>
    </AdminBlock>
  )
}

const INSERT_PROGRAM_CONTENT = gql`
  mutation INSERT_PROGRAM_CONTENT(
    $programContentSectionId: uuid!
    $title: String!
    $position: Int!
    $publishedAt: timestamptz
  ) {
    insert_program_content(
      objects: {
        content_section_id: $programContentSectionId
        title: $title
        position: $position
        program_content_body: { data: { type: "text", data: {} } }
        published_at: $publishedAt
      }
    ) {
      returning {
        id
      }
    }
  }
`
const UPDATE_PROGRAM_CONTENT_SECTION = gql`
  mutation UPDATE_PROGRAM_CONTENT_SECTION($id: uuid!, $title: String) {
    update_program_content_section(where: { id: { _eq: $id } }, _set: { title: $title }) {
      affected_rows
    }
  }
`
const DELETE_PROGRAM_CONTENT_SECTION = gql`
  mutation DELETE_PROGRAM_CONTENT_SECTION($programContentSectionId: uuid!) {
    delete_program_content(where: { content_section_id: { _eq: $programContentSectionId } }) {
      affected_rows
    }
    delete_program_content_section(where: { id: { _eq: $programContentSectionId } }) {
      affected_rows
    }
  }
`

export default ProgramContentSectionAdminCard
