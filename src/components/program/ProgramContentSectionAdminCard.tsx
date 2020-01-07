import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Icon, Menu, Typography } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { programContentSectionSchema, programSchema } from '../../schemas/program'
import types from '../../types'
import AdminCard from '../admin/AdminCard'
import ProgramContentAdminItem from './ProgramContentAdminItem'

const StyledAdminCard = styled(AdminCard)`
  h4 {
    font-size: 16px;
  }
`

const ProgramContentSectionAdminCard: React.FC<{
  program: InferType<typeof programSchema>
  programContentSection: InferType<typeof programContentSectionSchema>
  onDelete?: () => void
  onUpdate?: () => void
  onRefetch?: () => void
}> = ({ program, programContentSection, onDelete, onUpdate, onRefetch }) => {
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
    <StyledAdminCard>
      <div className="d-flex justify-content-between align-items-center">
        <Typography.Title
          className="mb-4"
          level={4}
          editable={{
            onChange: title => {
              updateProgramContentSection({
                variables: { id: programContentSection.id, title },
              }).then(() => onUpdate && onUpdate())
            },
          }}
        >
          {programContentSection.title}
        </Typography.Title>

        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item
                onClick={() =>
                  window.confirm('此區塊內的所有內容將被刪除，此動作無法還原') &&
                  deleteProgramContentSection({
                    variables: { programContentSectionId: programContentSection.id },
                  }).then(() => onDelete && onDelete())
                }
              >
                刪除區塊
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Icon type="more" />
        </Dropdown>
      </div>

      {programContentSection.programContents.map(programContent => (
        <div key={programContent.id} className="mb-2">
          <ProgramContentAdminItem
            program={program}
            showPlans={program.isSubscription}
            onRefetch={onRefetch}
            programContent={programContent}
          />
        </div>
      ))}

      <Button
        icon="plus"
        type="link"
        onClick={() =>
          createProgramContent({
            variables: {
              programContentSectionId: programContentSection.id,
              title: '未命名內容',
              position: programContentSection.programContents.length,
              publishedAt: program.publishedAt ? undefined : new Date(),
            },
          }).then(() => onRefetch && onRefetch())
        }
      >
        新增內容
      </Button>
    </StyledAdminCard>
  )
}

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
export default ProgramContentSectionAdminCard
