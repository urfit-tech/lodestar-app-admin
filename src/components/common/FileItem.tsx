import { CloseOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { message, Progress } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'

const messages = defineMessages({
  failedDownload: { id: 'common.event.failedDownload', defaultMessage: '下載失敗' },
})

const StyledFileItem = styled.div<{ isFailed?: boolean }>`
  color: ${props => (props.isFailed ? 'var(--error)' : 'var(--gray-darker)')};
  font-size: 14px;

  :hover {
    background-color: var(--gray-lighter);
  }
`

const FileItem: React.FC<{
  fileName: string
  loadingProgress?: number
  isFailed?: boolean
  onDelete?: () => void
  onDownload?: () => Promise<any>
}> = ({ fileName, loadingProgress, isFailed, onDelete, onDownload }) => {
  const { formatMessage } = useIntl()
  const [isHover, setIsHover] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <>
      <StyledFileItem
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="d-flex align-items-center justify-content-between py-1 px-2"
        isFailed={isFailed}
      >
        <div className="flex-grow-1">{fileName}</div>
        {isDownloading ? (
          <LoadingOutlined className="flex-shrink-0 ml-2 " />
        ) : (
          <>
            <DownloadOutlined
              hidden={!(isHover && onDownload)}
              className="flex-shrink-0 ml-2 pointer-cursor"
              onClick={async () => {
                setIsDownloading(true)
                await onDownload?.().catch(() => {
                  message.error(formatMessage(messages.failedDownload))
                })
                setIsDownloading(false)
              }}
            />
            <CloseOutlined
              hidden={!(isHover && onDelete)}
              className="flex-shrink-0 ml-2 pointer-cursor"
              onClick={onDelete}
            />
          </>
        )}
      </StyledFileItem>
      {!!loadingProgress && <Progress percent={loadingProgress} strokeColor="#4ed1b3" />}
    </>
  )
}

export default FileItem
