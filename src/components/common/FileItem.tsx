import { CloseOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { message, Progress } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'

const messages = defineMessages({
  failedDownload: { id: 'common.event.failedDownload', defaultMessage: '下載失敗' },
})

const StyledActionBlock = styled.span``
const StyledFileItem = styled.div`
  ${StyledActionBlock} svg {
    display: none;
  }
  :hover {
    background-color: var(--gray-lighter);
    ${StyledActionBlock} svg {
      display: inline-block;
    }
  }
`
const StyledFileName = styled.div<{ isFailed?: boolean }>`
  color: ${props => (props.isFailed ? 'var(--error)' : 'var(--gray-darker)')};
  font-size: 14px;
`

const FileItem: React.FC<{
  fileName: string
  loadingProgress?: number
  isFailed?: boolean
  onDelete?: () => void
  onDownload?: () => Promise<any>
}> = ({ fileName, loadingProgress, isFailed, onDelete, onDownload }) => {
  const { formatMessage } = useIntl()

  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <StyledFileItem>
      <div className="d-flex align-items-center justify-content-between py-1 px-2">
        <StyledFileName isFailed={isFailed} className="flex-grow-1">
          {fileName}
        </StyledFileName>
        {isDownloading ? (
          <LoadingOutlined className="flex-shrink-0 ml-2 " />
        ) : (
          <StyledActionBlock>
            <DownloadOutlined
              hidden={!onDownload}
              className="flex-shrink-0 ml-2 pointer-cursor"
              onClick={async () => {
                setIsDownloading(true)
                await onDownload?.().catch(() => {
                  message.error(formatMessage(messages.failedDownload))
                })
                setIsDownloading(false)
              }}
            />
            <CloseOutlined hidden={!onDelete} className="flex-shrink-0 ml-2 pointer-cursor" onClick={onDelete} />
          </StyledActionBlock>
        )}
      </div>
      {!!loadingProgress && <Progress className="ml-2" percent={loadingProgress} strokeColor="#4ed1b3" />}
    </StyledFileItem>
  )
}

export default FileItem
