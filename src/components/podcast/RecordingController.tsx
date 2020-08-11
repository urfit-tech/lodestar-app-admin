import Icon from '@ant-design/icons'
import { Button, Divider, Tooltip } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { desktopViewMixin, durationFormatter } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { ReactComponent as BackwardIcon } from '../../images/icon/backward.svg'
import { ReactComponent as ForwardIcon } from '../../images/icon/forward.svg'
import { ReactComponent as PauseCircleIcon } from '../../images/icon/pause-circle.svg'
import { ReactComponent as PlayCircleIcon } from '../../images/icon/play-circle.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import { ReactComponent as TrimIcon } from '../../images/icon/trim.svg'
import { ReactComponent as UploadIcon } from '../../images/icon/upload.svg'
import Responsive from '../common/Responsive'

const StyledWrapper = styled.div<{ hidden?: boolean }>`
  position: fixed;
  bottom: 0;
  width: 100%;
  visibility: ${props => (props.hidden ? '0%' : '100%')};
`
const StyledOverlay = styled.div<{ active?: boolean }>`
  position: relative;
  z-index: 999;
  padding: 1rem 0;
  background: white;
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
  box-shadow: 0 -1px 6px 1px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: transform 0.2s ease-in-out;
  transform: translateY(${props => (props.active ? '4%' : '100%')});
`
const StyledBar = styled.div`
  position: relative;
  z-index: 1000;
  background: #323232;
  color: white;
`
const StyledAction = styled.div`
  ${desktopViewMixin(css`
    > * {
      margin-left: 2rem;
    }
  `)}
  .ant-btn-link[disabled] {
    color: #fff !important;
    padding: 0;
  }
`

const StyledOverlayButton = styled(Button)`
  height: 52px;
  color: var(--gray-darker);
  .anticon {
    font-size: 24px;
  }
`
const StyledBarIconButton = styled(Button)<{ height?: string; iconSize?: string }>`
  height: ${props => (props.height ? props.height : '36px')};
  color: white;
  font-size: ${props => props.iconSize || '24px'};
  line-height: 1;
  span {
    line-height: 1;
  }
  &:hover,
  &:focus,
  &:active {
    color: #cdcdcd;
  }
  &[disabled] {
    color: rgba(255, 255, 255, 0.5) !important;
  }
`
const StyledButton = styled(Button)`
  height: 40px;
  color: white;
  span {
    line-height: 1.5;
  }
  &:hover,
  &:focus,
  &:active {
    color: var(--gray);
    border-color: var(--gray);
  }
`
const TooltipText = styled.span`
  font-size: 12px;
`
const StyledOnTopWrapper = styled(StyledWrapper)`
  z-index: 100;
`

const RecordingController: React.FC<{
  hidden?: boolean
  name: string
  duration: number
  isPlaying?: boolean
  isEditing?: boolean
  isDeleteDisabled?: boolean
  isUploadDisabled?: boolean
  onPlay?: () => void
  onPause?: () => void
  onForward?: () => void
  onBackward?: () => void
  onTrim?: () => void
  onDelete?: () => void
  onUpload?: () => void
  onEdit?: () => void
}> = ({
  hidden,
  name,
  duration,
  isPlaying,
  isEditing,
  isDeleteDisabled,
  isUploadDisabled,
  onPlay,
  onPause,
  onForward,
  onBackward,
  onTrim,
  onDelete,
  onUpload,
  onEdit,
}) => {
  const { formatMessage } = useIntl()

  return (
    <StyledOnTopWrapper hidden={hidden}>
      <Responsive.Default>
        <StyledOverlay className="d-flex align-items-center justify-content-around" active={isEditing}>
          <div className="flex-grow-1 text-center">
            <StyledOverlayButton type="link" size="small" onClick={() => onDelete && onDelete()}>
              <Icon component={() => <TrashOIcon />} className="d-block mb-1" />
              <div>{formatMessage(podcastMessages.ui.deleteAudio)}</div>
            </StyledOverlayButton>
          </div>
          <Divider type="vertical" style={{ height: '49px' }} />
          <div className="flex-grow-1 text-center">
            <StyledOverlayButton type="link" size="small">
              <Icon component={() => <UploadIcon />} className="d-block mb-1" onClick={() => onUpload && onUpload()} />
              <div>{formatMessage(podcastMessages.ui.bulkUpload)}</div>
            </StyledOverlayButton>
          </div>
        </StyledOverlay>
      </Responsive.Default>

      <StyledBar className="py-1">
        <div className="container">
          <Responsive.Default>
            <div className="text-center">
              {name} {durationFormatter(duration)}
            </div>
          </Responsive.Default>

          <div className="row justify-content-between py-2">
            <div className="col-3 col-lg-4 d-flex align-items-center">
              <Responsive.Default>
                <Tooltip title={<TooltipText>{formatMessage(podcastMessages.ui.trim)}</TooltipText>}>
                  <StyledBarIconButton type="link" className="p-0" onClick={() => onTrim && onTrim()}>
                    <Icon component={() => <TrimIcon />} />
                  </StyledBarIconButton>
                </Tooltip>
              </Responsive.Default>
              <Responsive.Desktop>
                <div className="text-center">
                  {name} {durationFormatter(duration)}
                </div>
              </Responsive.Desktop>
            </div>

            <div className="col-6 col-lg-4 d-flex align-items-center justify-content-center">
              <Tooltip title={<TooltipText>{formatMessage(podcastMessages.ui.backward)}</TooltipText>}>
                <StyledBarIconButton type="link" className="p-0" onClick={() => onBackward && onBackward()}>
                  <BackwardIcon />
                </StyledBarIconButton>
              </Tooltip>

              <StyledBarIconButton
                type="link"
                className="mx-0"
                height="66px"
                iconSize="44px"
                onClick={() => (isPlaying ? onPause && onPause() : onPlay && onPlay())}
              >
                {isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />}
              </StyledBarIconButton>

              <Tooltip title={<TooltipText>{formatMessage(podcastMessages.ui.forward)}</TooltipText>}>
                <StyledBarIconButton type="link" className="p-0" onClick={() => onForward && onForward()}>
                  <ForwardIcon />
                </StyledBarIconButton>
              </Tooltip>
            </div>

            <StyledAction className="col-3 col-lg-4 d-flex align-items-center justify-content-end">
              <Responsive.Desktop>
                <Tooltip title={<TooltipText>{formatMessage(podcastMessages.ui.trim)}</TooltipText>}>
                  <StyledBarIconButton type="link" className="p-0 m-0" onClick={() => onTrim && onTrim()}>
                    <TrimIcon />
                  </StyledBarIconButton>
                </Tooltip>
                <Divider
                  type="vertical"
                  style={{ top: 0, marginRight: '0', height: '24px', backgroundColor: 'white' }}
                />
                {isEditing && (
                  <>
                    <Tooltip title={<TooltipText>{formatMessage(commonMessages.ui.delete)}</TooltipText>}>
                      <StyledBarIconButton
                        disabled={isDeleteDisabled}
                        type="link"
                        className="p-0"
                        onClick={() => onDelete && onDelete()}
                      >
                        <TrashOIcon />
                      </StyledBarIconButton>
                    </Tooltip>
                    <Tooltip title={<TooltipText>{formatMessage(podcastMessages.ui.upload)}</TooltipText>}>
                      <StyledBarIconButton
                        disabled={isUploadDisabled}
                        type="link"
                        className="p-0"
                        onClick={() => onUpload && onUpload()}
                      >
                        <UploadIcon />
                      </StyledBarIconButton>
                    </Tooltip>
                  </>
                )}
              </Responsive.Desktop>
              <StyledButton className="py-2 px-3" size="small" ghost onClick={() => onEdit && onEdit()}>
                {isEditing ? formatMessage(commonMessages.ui.cancel) : formatMessage(commonMessages.ui.edit)}
              </StyledButton>
            </StyledAction>
          </div>
        </div>
      </StyledBar>
    </StyledOnTopWrapper>
  )
}

export default RecordingController
