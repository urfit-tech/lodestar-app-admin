import { QueryResult } from '@apollo/react-common'
import { useQuery } from '@apollo/react-hooks'
import { Card, Icon, Select } from 'antd'
import gql from 'graphql-tag'
import { prop, sortBy, uniq } from 'ramda'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { array, InferType, object } from 'yup'
import { dateFormatter, durationFormatter } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { programContentSchema, programContentSectionSchema, programSchema } from '../../schemas/program'
import types from '../../types'

const StyledProgramContentMenu = styled.div`
  background: white;
  font-size: 14px;
`
const StyledHead = styled.div`
  padding: 1.25rem;
`
const StyledSelectBlock = styled.div`
  .ant-select-selection--single {
    height: 32px;
  }
  .ant-select-selection-selected-value {
    padding-right: 0.5rem;
    font-size: 14px;
  }
  .ant-select-selection__rendered {
    line-height: 32px;
  }
`
const StyledContentSection = styled.div`
  border-top: 1px solid #ececec;
`
const StyledContentSectionTitle = styled.div`
  padding: 1.25rem;
  font-size: 16px;
  font-weight: bold;
`
const StyledItemTitle = styled.div`
  color: #585858;
  font-size: 14px;
`
const StyledIconWrapper = styled.div`
  position: absolute;
  top: 16px;
  right: 12px;
  width: 20px;
  height: 20px;
  border: 1px solid transparent;
  border-radius: 50%;
  text-align: center;
  font-size: 10px;
  line-height: 20px;
`
const StyledItem = styled.div`
  position: relative;
  padding-top: 1rem;
  padding-right: 4rem;
  padding-bottom: 1rem;
  padding-left: 2rem;
  color: #9b9b9b;
  font-size: 12px;
  cursor: pointer;

  &.active {
    background: ${props => props.theme['@processing-color']};
    color: ${props => props.theme['@primary-color']};
  }
  /* &.unread::before {
    position: absolute;
    top: 24px;
    left: 16px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.theme['@primary-color']};
    content: '';
  } */
  &.unread ${StyledIconWrapper} {
    border-color: #cdcdcd;
    color: transparent;
  }
  &.half ${StyledIconWrapper} {
    background: #cdcdcd;
    color: #9b9b9b;
  }
  &.done ${StyledIconWrapper} {
    background: ${props => props.theme['@primary-color']};
    color: white;
  }
`

const messages = defineMessages({
  contentMenu: { id: 'program.label.contentMenu', defaultMessage: '課程列表' },
  sortBySection: { id: 'program.ui.sortBySection', defaultMessage: '單元排序' },
  sortByDate: { id: 'program.ui.sortByDate', defaultMessage: '時間排序' },
})

type ProgramContentMenuProps = {
  activeProgramContentId?: string
  program: InferType<typeof programSchema>
  memberId: string
  onSelect?: (programContentId: string) => void
}
const ProgramContentMenu: React.FC<ProgramContentMenuProps> = ({
  program,
  memberId,
  activeProgramContentId,
  onSelect,
}) => {
  const { formatMessage } = useIntl()
  const query = useQuery<types.GET_PROGRAM_CONTENTS_WITH_BODY, types.GET_PROGRAM_CONTENTS_WITH_BODYVariables>(
    GET_PROGRAM_CONTENTS_WITH_BODY,
    {
      variables: { programId: program.id },
    },
  )

  const [sortBy, setSortBy] = useState('section')

  return (
    <StyledProgramContentMenu>
      <StyledHead className="d-flex justify-content-between align-items-center">
        <span>{formatMessage(messages.contentMenu)}</span>
        <StyledSelectBlock>
          <Select size="default" value={sortBy} onChange={(value: string) => setSortBy(value)}>
            <Select.Option value="section">{formatMessage(messages.sortBySection)}</Select.Option>
            <Select.Option value="date">{formatMessage(messages.sortByDate)}</Select.Option>
          </Select>
        </StyledSelectBlock>
      </StyledHead>

      {sortBy === 'section' && (
        <ProgramContentMenuBySection
          program={program}
          activeProgramContentId={activeProgramContentId}
          query={query}
          onSelect={onSelect}
        />
      )}
      {sortBy === 'date' && (
        <ProgramContentMenuByDate
          program={program}
          activeProgramContentId={activeProgramContentId}
          query={query}
          onSelect={onSelect}
        />
      )}
    </StyledProgramContentMenu>
  )
}

const ProgramContentMenuBySection: React.FC<{
  program: InferType<typeof programSchema>
  activeProgramContentId?: string
  query: QueryResult<any, any>
  onSelect?: (programContentId: string) => void
}> = ({ program, activeProgramContentId, query, onSelect }) => {
  const { formatMessage } = useIntl()

  const castData = gqlResultSchema.cast(query.data)
  const programContents = castData.programContentBody
    .flatMap(contentBody => contentBody.programContents)
    .filter(programContent => programContent.publishedAt && new Date() >= programContent.publishedAt)

  const programContentSections = sortBy(prop('position'))(
    uniq(programContents.map(programContent => programContent.programContentSection)),
  )

  return query.loading ? (
    <div>{formatMessage(commonMessages.event.loading)}</div>
  ) : query.error ? (
    <div>{formatMessage(errorMessages.data.fetch)}</div>
  ) : programContentSections.length === 0 ? (
    <EmptyMenu />
  ) : (
    <>
      {programContentSections.map(programContentSection => (
        <StyledContentSection key={programContentSection.id}>
          <StyledContentSectionTitle>{programContentSection.title}</StyledContentSectionTitle>

          {programContents
            .filter(programContent => programContent.programContentSection.id === programContentSection.id)
            .sort((a, b) => (a.position || -1) - (b.position || -1))
            .map(programContent => (
              <SortBySectionItem
                key={programContent.id}
                program={program}
                programContent={programContent}
                active={programContent.id === activeProgramContentId}
                onClick={() => onSelect && onSelect(programContent.id)}
              />
            ))}
        </StyledContentSection>
      ))}
    </>
  )
}

const ProgramContentMenuByDate: React.FC<{
  program: InferType<typeof programSchema>
  activeProgramContentId?: string
  query: QueryResult<any, any>
  onSelect?: (programContentId: string) => void
}> = ({ program, activeProgramContentId, query, onSelect }) => {
  const { formatMessage } = useIntl()

  const castData = gqlResultSchema.cast(query.data)
  const programContents = castData.programContentBody
    .flatMap(contentBody => contentBody.programContents)
    .filter(programContent => programContent.publishedAt && new Date() >= programContent.publishedAt)
    .sort((a, b) => (a.publishedAt && b.publishedAt && a.publishedAt < b.publishedAt ? 1 : -1))

  return query.loading ? (
    <div>{formatMessage(commonMessages.event.loading)}</div>
  ) : query.error ? (
    <div>{formatMessage(errorMessages.data.fetch)}</div>
  ) : programContents.length === 0 ? (
    <EmptyMenu />
  ) : (
    <div>
      {programContents.map(programContent => {
        return (
          <SortByDateItem
            key={programContent.id}
            program={program}
            programContent={programContent}
            active={programContent.id === activeProgramContentId}
            onClick={() => onSelect && onSelect(programContent.id)}
          />
        )
      })}
    </div>
  )
}

const SortBySectionItem: React.FC<{
  program: InferType<typeof programSchema>
  programContent: InferType<typeof programContentSchema>
  active?: boolean
  onClick?: () => void
}> = ({ program, programContent, active, onClick }) => {
  const { history } = useRouter()
  const progressStatus =
    !programContent.programContentProgress ||
    programContent.programContentProgress.length === 0 ||
    programContent.programContentProgress[0].progress === 0
      ? 'unread'
      : programContent.programContentProgress[0].progress === 1
      ? 'done'
      : 'half'

  return (
    <StyledItem
      className={`${progressStatus} ${active ? 'active' : ''}`}
      onClick={() => {
        onClick && onClick()
        history.push(`/programs/${program.id}/contents/${programContent.id}`)
      }}
    >
      <StyledItemTitle className="mb-3">{programContent.title}</StyledItemTitle>

      <StyledIconWrapper>
        <Icon type="check" />
      </StyledIconWrapper>

      {programContent.programContentBody && programContent.programContentBody.type === 'video' ? (
        <div>
          <Icon type="video-camera" className="mr-2" />
          {durationFormatter(programContent.duration)}
        </div>
      ) : (
        <div>
          <Icon type="file-text" />
        </div>
      )}
    </StyledItem>
  )
}

const SortByDateItem: React.FC<{
  program: InferType<typeof programSchema>
  programContent: InferType<typeof programContentSchema>
  active?: boolean
  onClick?: () => void
}> = ({ program, programContent, active, onClick }) => {
  const { history } = useRouter()
  const progressStatus =
    !programContent.programContentProgress ||
    programContent.programContentProgress.length === 0 ||
    programContent.programContentProgress[0].progress === 0
      ? 'unread'
      : programContent.programContentProgress[0].progress === 1
      ? 'done'
      : 'half'

  return (
    <StyledItem
      className={`${progressStatus} ${active ? 'active' : ''}`}
      onClick={() => {
        onClick && onClick()
        history.push(`/programs/${program.id}/contents/${programContent.id}`)
      }}
    >
      <StyledItemTitle className="mb-3">{programContent.title}</StyledItemTitle>

      <StyledIconWrapper>
        <Icon type="check" />
      </StyledIconWrapper>

      <div>
        <Icon type="calendar" className="mr-2" />
        {programContent.publishedAt && dateFormatter(programContent.publishedAt)}
      </div>
    </StyledItem>
  )
}

const EmptyMenu = () => {
  return <Card style={{ textAlign: 'center', color: '#9b9b9b' }}>初次購買還沒有新的內容喔～</Card>
}

const GET_PROGRAM_CONTENTS_WITH_BODY = gql`
  query GET_PROGRAM_CONTENTS_WITH_BODY($programId: uuid!) {
    program_content_body(
      where: { program_contents: { program_content_section: { program_id: { _eq: $programId } } } }
    ) {
      program_contents(order_by: { published_at: desc }) {
        id
        title
        position
        published_at
        duration
        program_content_progress {
          id
          progress
        }
        program_content_body {
          id
          type
        }
        program_content_section {
          id
          title
          position
        }
      }
    }
  }
`

const gqlResultSchema = object({
  programContentBody: array(
    object({
      programContents: array(
        programContentSchema.concat(
          object({
            programContentSection: programContentSectionSchema,
          }).camelCase(),
        ),
      ),
    }).camelCase(),
  ).default([]),
}).camelCase()

export default ProgramContentMenu
