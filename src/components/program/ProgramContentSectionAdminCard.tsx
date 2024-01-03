import { MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, Dropdown, Menu, Typography } from 'antd'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { ProgramContentSectionProps } from '../../types/program'
import { AdminBlock } from '../admin'
import ProgramContentAdminItem from './ProgramContentAdminItem'
import programMessages from './translation'

const StyledMenuItem = styled(Menu.Item)`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  letter-spacing: 0.4px;
  :hover {
    color: ${props => props.theme['@primary-color']};
  }
`

const ProgramContentSectionAdminCard: React.FC<{
  programId: string
  isProgramPublished: boolean
  programContentSection: ProgramContentSectionProps
  onRefetch?: () => void
}> = ({ programId, isProgramPublished, programContentSection, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const [createProgramContent] = useMutation<hasura.INSERT_PROGRAM_CONTENT, hasura.INSERT_PROGRAM_CONTENTVariables>(
    INSERT_PROGRAM_CONTENT,
  )
  const { insertExam } = useCreateExam()

  const [updateProgramContentSection] = useMutation<
    hasura.UPDATE_PROGRAM_CONTENT_SECTION,
    hasura.UPDATE_PROGRAM_CONTENT_SECTIONVariables
  >(UPDATE_PROGRAM_CONTENT_SECTION)
  const [deleteProgramContentSection] = useMutation<
    hasura.DELETE_PROGRAM_CONTENT_SECTION,
    hasura.DELETE_PROGRAM_CONTENT_SECTIONVariables
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
                .then(() => onRefetch?.())
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
                  window.confirm(formatMessage(programMessages.ProgramContentSectionAdminCard.deleteSectionWarning)) &&
                  deleteProgramContentSection({
                    variables: { programContentSectionId: programContentSection.id },
                  })
                    .then(() => onRefetch?.())
                    .catch(handleError)
                }
              >
                {formatMessage(programMessages.ProgramContentSectionAdminCard.deleteSection)}
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
            programId={programId}
            isProgramPublished={isProgramPublished}
            programContent={programContent}
            showPlans
            onRefetch={onRefetch}
          />
        </div>
      ))}
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu>
            <StyledMenuItem
              onClick={() =>
                createProgramContent({
                  variables: {
                    programContentSectionId: programContentSection.id,
                    title: 'untitled',
                    position: programContentSection.programContents.length,
                    programContentType: 'video',
                    publishedAt: isProgramPublished ? new Date() : null,
                    displayMode: isProgramPublished ? 'payToWatch' : 'conceal',
                  },
                })
                  .then(() => onRefetch?.())
                  .catch(handleError)
              }
            >
              {formatMessage(programMessages['*'].videoContent)}
            </StyledMenuItem>
            <StyledMenuItem
              onClick={() =>
                createProgramContent({
                  variables: {
                    programContentSectionId: programContentSection.id,
                    title: 'untitled',
                    position: programContentSection.programContents.length,
                    programContentType: 'text',
                    publishedAt: isProgramPublished ? new Date() : null,
                    displayMode: isProgramPublished ? 'payToWatch' : 'conceal',
                  },
                })
                  .then(() => onRefetch?.())
                  .catch(handleError)
              }
            >
              {formatMessage(programMessages['*'].articleContent)}
            </StyledMenuItem>
            <StyledMenuItem
              onClick={() =>
                createProgramContent({
                  variables: {
                    programContentSectionId: programContentSection.id,
                    title: 'untitled',
                    position: programContentSection.programContents.length,
                    programContentType: 'audio',
                    publishedAt: isProgramPublished ? new Date() : null,
                    displayMode: isProgramPublished ? 'payToWatch' : 'conceal',
                  },
                })
                  .then(() => onRefetch?.())
                  .catch(handleError)
              }
            >
              {formatMessage(programMessages['*'].audioContent)}
            </StyledMenuItem>
            {enabledModules.ebook ? (
              <StyledMenuItem
                onClick={() =>
                  createProgramContent({
                    variables: {
                      programContentSectionId: programContentSection.id,
                      title: 'untitled',
                      position: programContentSection.programContents.length,
                      programContentType: 'ebook',
                      publishedAt: isProgramPublished ? new Date() : null,
                      displayMode: isProgramPublished ? 'payToWatch' : 'conceal',
                    },
                  })
                    .then(() => onRefetch?.())
                    .catch(handleError)
                }
              >
                {formatMessage(programMessages['*'].ebook)}
              </StyledMenuItem>
            ) : null}
            {enabledModules.practice && (
              <StyledMenuItem
                onClick={() =>
                  createProgramContent({
                    variables: {
                      programContentSectionId: programContentSection.id,
                      title: 'untitled',
                      position: programContentSection.programContents.length,
                      programContentType: 'practice',
                      publishedAt: isProgramPublished ? new Date() : null,
                      displayMode: isProgramPublished ? 'payToWatch' : 'conceal',
                    },
                  })
                    .then(() => onRefetch?.())
                    .catch(handleError)
                }
              >
                {formatMessage(programMessages.ProgramContentSectionAdminCard.programPractice)}
              </StyledMenuItem>
            )}
            {enabledModules.exam && (
              <StyledMenuItem
                onClick={async () => {
                  await insertExam({ variables: { appId } })
                    .then(res =>
                      createProgramContent({
                        variables: {
                          programContentSectionId: programContentSection.id,
                          title: 'untitled',
                          position: programContentSection.programContents.length,
                          programContentType: 'exam',
                          target: res.data?.insert_exam_one?.id,
                          publishedAt: isProgramPublished ? new Date() : null,
                          displayMode: isProgramPublished ? 'payToWatch' : 'conceal',
                        },
                      }).catch(handleError),
                    )
                    .catch(handleError)
                  onRefetch?.()
                }}
              >
                {formatMessage(programMessages.ProgramContentSectionAdminCard.programExercise)}
              </StyledMenuItem>
            )}
          </Menu>
        }
        placement="topCenter"
      >
        <Button type="link" icon={<PlusOutlined />}>
          {formatMessage(programMessages.ProgramContentSectionAdminCard.createContent)}
        </Button>
      </Dropdown>
    </AdminBlock>
  )
}

const useCreateExam = () => {
  const [insertExam] = useMutation<hasura.INSERT_EXAM, hasura.INSERT_EXAMVariables>(
    gql`
      mutation INSERT_EXAM($appId: String!) {
        insert_exam_one(object: { app_id: $appId, point: 0, passing_score: 0 }) {
          id
        }
      }
    `,
  )
  return {
    insertExam,
  }
}

const INSERT_PROGRAM_CONTENT = gql`
  mutation INSERT_PROGRAM_CONTENT(
    $programContentSectionId: uuid!
    $title: String!
    $position: Int!
    $publishedAt: timestamptz
    $programContentType: String!
    $metadata: jsonb
    $displayMode: String!
    $target: uuid
  ) {
    insert_program_content_one(
      object: {
        content_section_id: $programContentSectionId
        title: $title
        position: $position
        program_content_body: { data: { type: $programContentType, data: {}, target: $target } }
        published_at: $publishedAt
        metadata: $metadata
        display_mode: $displayMode
      }
    ) {
      id
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
    delete_program_content_progress(
      where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content_body(
      where: { program_contents: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content(where: { content_section_id: { _eq: $programContentSectionId } }) {
      affected_rows
    }
    delete_program_content_section(where: { id: { _eq: $programContentSectionId } }) {
      affected_rows
    }
    delete_exercise(
      where: { program_content: { program_content_section: { id: { _eq: $programContentSectionId } } } }
    ) {
      affected_rows
    }
    #FIXME: should delete relation data, practice, exam and exercise ?
  }
`

export default ProgramContentSectionAdminCard
