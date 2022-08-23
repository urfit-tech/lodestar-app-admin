import Icon, { FileTextOutlined } from '@ant-design/icons'
import { Tag, Typography } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateFormatter } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ReactComponent as PracticeIcon } from '../../images/icon/homework.svg'
import { ReactComponent as QuizIcon } from '../../images/icon/quiz.svg'
import { ReactComponent as VideoIcon } from '../../images/icon/video.svg'
import { ProgramAdminProps, ProgramContentProps } from '../../types/program'
import ExerciseAdminModal from './ExerciseAdminModal'
import PracticeAdminModal from './PracticeAdminModal'
import ProgramContentAdminModal from './ProgramContentAdminModal'
import programMessages from './translation'

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
    letter-spacing: 0.6px;
    font-weight: 500;
  }
`
const StyledDisplayModeTag = styled(StyledTag)<{ variant?: string }>`
  ${props =>
    props.variant === 'conceal'
      ? `&&&{
        background: transparent;
        color: var(--gray-dark);
        border: solid 1px var(--gray);
      }`
      : `&&&{
    background: #ffbe1e;
  }`}
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
        {programContent.metadata?.withInvalidQuestion && (
          <Icon className="mr-3" component={() => <ExclamationCircleIcon />} />
        )}

        {programContent.displayMode === 'conceal' ? (
          <StyledDisplayModeTag className="mr-3" variant="conceal">
            {formatMessage(programMessages.DisplayModeSelector.conceal)}
          </StyledDisplayModeTag>
        ) : programContent.displayMode === 'trial' ? (
          <StyledDisplayModeTag className="mr-3">
            {formatMessage(programMessages.DisplayModeSelector.trial)}
          </StyledDisplayModeTag>
        ) : programContent.displayMode === 'loginToTrial' ? (
          <StyledDisplayModeTag className="mr-3">
            {formatMessage(programMessages.DisplayModeSelector.loginToTrial)}
          </StyledDisplayModeTag>
        ) : null}

        {programContent.metadata?.private && (
          <StyledPrivateTag className="mr-3">
            {formatMessage(programMessages.ProgramContentAdminItem.privatePractice)}
          </StyledPrivateTag>
        )}

        {program
          ? programContent.publishedAt && (
              <StyledDescriptions type="secondary" className="mr-3">
                {dateFormatter(programContent.publishedAt)}
              </StyledDescriptions>
            )
          : null}

        {programContent.programContentType === 'practice' ? (
          <PracticeAdminModal programContent={programContent} onRefetch={onRefetch} />
        ) : programContent.programContentType === 'exercise' ? (
          <ExerciseAdminModal programContent={programContent} onRefetch={onRefetch} />
        ) : (
          <ProgramContentAdminModal program={program} programContent={programContent} onRefetch={onRefetch} />
        )}
      </div>
    </div>
  )
}

export default ProgramContentAdminItem
