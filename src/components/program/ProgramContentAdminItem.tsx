import Icon, { EyeInvisibleOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Tag, Typography } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateFormatter, handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProgramContentBody } from '../../hooks/program'
import { ReactComponent as PracticeIcon } from '../../images/icon/homework.svg'
import { ReactComponent as QuizIcon } from '../../images/icon/quiz.svg'
import { ReactComponent as VideoIcon } from '../../images/icon/video.svg'
import types from '../../types'
import { ProgramAdminProps, ProgramContentProps } from '../../types/program'
import ExerciseAdminModal from './ExerciseAdminModal'
import ProgramContentAdminModal from './ProgramContentAdminModal'
import ProgramContentPracticeAdminModal from './ProgramContentPracticeAdminModal'

const StyledIcon = styled(Icon)`
  color: #9b9b9b;
`
const StyledTitle = styled.div`
  font-size: 14px;
`
const StyledDescriptions = styled(Typography.Text)`
  clear: right;
  font-size: 12px;
`
const StyledTag = styled(Tag)`
  && {
    border: none;
    color: #fff;
    border-radius: 4px;
    letter-spacing: 0.58px;
    font-weight: 500;
  }
`
const StyledTrialTag = styled(StyledTag)`
  background: #ffbe1e;
`
const StyledPrivateTag = styled(StyledTag)`
  background: var(--gray-darker);
`
const messages = defineMessages({
  programContentPlans: { id: 'program.text.programContentPlans', defaultMessage: '方案：' },
})

const ProgramContentAdminItem: React.FC<{
  program: ProgramAdminProps
  programContent: ProgramContentProps
  showPlans?: boolean | null
  onRefetch?: () => void
}> = ({ showPlans, programContent, program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateProgramContent] = useMutation<types.PUBLISH_PROGRAM_CONTENT, types.PUBLISH_PROGRAM_CONTENTVariables>(
    PUBLISH_PROGRAM_CONTENT,
  )
  const { loadingProgramContentBody, programContentBody, refetchProgramContentBody } = useProgramContentBody(
    programContent.id,
  )

  return (
    <div className="d-flex align-items-center justify-content-between p-3" style={{ background: '#f7f8f8' }}>
      <div>
        <div className="d-flex">
          <div className="d-flex justify-content-center align-items-center mr-3">
            <StyledIcon
              component={() =>
                programContent.programContentType && programContent.programContentType === 'text' ? (
                  <FileTextOutlined />
                ) : programContent.programContentType === 'video' ? (
                  <VideoIcon />
                ) : programContent.programContentType === 'practice' ? (
                  <PracticeIcon />
                ) : programContent.programContentType === 'exercise' ? (
                  <QuizIcon />
                ) : null
              }
            />
          </div>
          <StyledTitle>{programContent.title}</StyledTitle>
        </div>
        {showPlans && (
          <StyledDescriptions type="secondary">
            {formatMessage(messages.programContentPlans)}
            {programContent.programPlans
              ?.map(programPlan => programPlan.title)
              .join(formatMessage(commonMessages.ui.comma))}
          </StyledDescriptions>
        )}
      </div>

      <div className="d-flex align-items-center">
        {programContent.listPrice === 0 && (
          <StyledTrialTag className="mr-3">{formatMessage(commonMessages.ui.trial)}</StyledTrialTag>
        )}
        {programContent.metadata?.private && (
          <StyledPrivateTag className="mr-3">{formatMessage(commonMessages.ui.private)}</StyledPrivateTag>
        )}
        {program && program.isSubscription ? (
          programContent.publishedAt && (
            <StyledDescriptions type="secondary" className="mr-3">
              {dateFormatter(programContent.publishedAt)}
            </StyledDescriptions>
          )
        ) : programContent.publishedAt ? (
          <EyeOutlined
            className="mr-3"
            onClick={() =>
              updateProgramContent({
                variables: {
                  programContentId: programContent.id,
                  publishedAt: null,
                },
              })
                .then(() => onRefetch?.())
                .catch(handleError)
            }
          />
        ) : (
          <EyeInvisibleOutlined
            className="mr-3"
            onClick={() =>
              updateProgramContent({
                variables: {
                  programContentId: programContent.id,
                  publishedAt: new Date(),
                },
              })
                .then(() => onRefetch?.())
                .catch(handleError)
            }
          />
        )}
        {loadingProgramContentBody ? null : programContent.programContentType === 'practice' ? (
          <ProgramContentPracticeAdminModal
            programContent={programContent}
            programContentBody={programContentBody}
            onRefetch={() => {
              refetchProgramContentBody()
              onRefetch?.()
            }}
          />
        ) : programContent.programContentType === 'exercise' ? (
          <ExerciseAdminModal
            programContent={programContent}
            programContentBody={programContentBody}
            onRefetch={() => {
              refetchProgramContentBody()
              onRefetch?.()
            }}
          />
        ) : (
          <ProgramContentAdminModal
            program={program}
            programContent={programContent}
            programContentBody={programContentBody}
            onRefetch={() => {
              refetchProgramContentBody()
              onRefetch?.()
            }}
          />
        )}
      </div>
    </div>
  )
}

const PUBLISH_PROGRAM_CONTENT = gql`
  mutation PUBLISH_PROGRAM_CONTENT($programContentId: uuid!, $publishedAt: timestamptz) {
    update_program_content(where: { id: { _eq: $programContentId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default ProgramContentAdminItem
