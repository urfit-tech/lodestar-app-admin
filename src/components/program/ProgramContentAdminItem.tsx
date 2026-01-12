import Icon, { FileTextOutlined } from '@ant-design/icons'
import { Tag, Typography } from 'antd'
import React from 'react'
import { IoIosLink } from 'react-icons/io'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateFormatter } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MicrophoneIcon } from '../../images/icon'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ReactComponent as PracticeIcon } from '../../images/icon/homework.svg'
import { BookHollowIcon } from '../../images/icon/index'
import PinIcon from '../../images/icon/pin-v-2.svg'
import { ReactComponent as QuizIcon } from '../../images/icon/quiz.svg'
import { ReactComponent as VideoIcon } from '../../images/icon/video.svg'
import { ProgramContentProps } from '../../types/program'
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
const StyledPinnedIcon = styled.span<{ pin: boolean }>`
  ${({ pin }) =>
    pin &&
    `
      ::before{
        content: url('${PinIcon}');
        position: absolute;
        top: -11px;
        right: -11px;
        font-size: 20px; 
      }
    `}
`
const messages = defineMessages({
  programContentPlans: { id: 'program.text.programContentPlans', defaultMessage: '方案：' },
})

const ProgramContentAdminItem: React.FC<{
  programId: string
  isProgramPublished: boolean
  programContent: ProgramContentProps
  showPlans?: boolean | null
  onRefetch?: () => void
}> = ({ programId, isProgramPublished, showPlans, programContent, onRefetch }) => {
  const { formatMessage } = useIntl()

  return (
    <div style={{ position: 'relative' }}>
      <StyledPinnedIcon pin={programContent.pinned_status}></StyledPinnedIcon>
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
                  ) : programContent.programContentType === 'audio' ? (
                    <MicrophoneIcon />
                  ) : programContent.programContentType === 'practice' ? (
                    <PracticeIcon />
                  ) : //TODO: remove exercise
                  programContent.programContentType === 'exercise' || programContent.programContentType === 'exam' ? (
                    <QuizIcon />
                  ) : programContent.programContentType === 'ebook' ? (
                    <BookHollowIcon />
                  ) : programContent.programContentType === 'link' ? (
                    <IoIosLink />
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
              {formatMessage(
                programContent.programContentType === 'audio'
                  ? programMessages.DisplayModeSelector.audioTrial
                  : programMessages.DisplayModeSelector.trial,
              )}
            </StyledDisplayModeTag>
          ) : programContent.displayMode === 'loginToTrial' ? (
            <StyledDisplayModeTag className="mr-3">
              {formatMessage(
                programContent.programContentType === 'audio'
                  ? programMessages.DisplayModeSelector.loginToAudioTrial
                  : programMessages.DisplayModeSelector.loginToTrial,
              )}
            </StyledDisplayModeTag>
          ) : null}

          {programContent.metadata?.private && (
            <StyledPrivateTag className="mr-3">
              {formatMessage(programMessages.ProgramContentAdminItem.privatePractice)}
            </StyledPrivateTag>
          )}

          {isProgramPublished
            ? programContent.publishedAt && (
                <StyledDescriptions type="secondary" className="mr-3">
                  {dateFormatter(programContent.publishedAt)}
                </StyledDescriptions>
              )
            : null}

          <ProgramContentAdminModal programId={programId} programContentId={programContent.id} onRefetch={onRefetch} />
        </div>
      </div>
    </div>
  )
}

export default ProgramContentAdminItem
