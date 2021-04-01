import { CloseOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { message, Progress } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { downloadFile, getFileDownloadableLink } from '../../helpers'

const messages = defineMessages({
  failedDownload: { id: 'common.event.failedDownload', defaultMessage: '下載失敗' },
})

const StyledFileItem = styled.div`
  color: var(--gray-darker);
  font-size: 14px;

  :hover {
    background-color: var(--gray-lighter);
  }
`

const FileItem: React.FC<{
  fileName: string
  downloadableLink?: string
  uploadFileDownloadableLink?: string
  uploadProgress?: number
  onDelete?: () => void
}> = ({ fileName, downloadableLink, uploadFileDownloadableLink, uploadProgress, onDelete }) => {
  const { formatMessage } = useIntl()
  const { authToken, apiHost } = useAuth()
  const [isHover, setIsHover] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <>
      <StyledFileItem
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="d-flex align-items-center justify-content-between py-1 px-2"
      >
        <div className="flex-grow-1">{fileName}</div>
        {isDownloading ? (
          <LoadingOutlined className="flex-shrink-0 ml-2 " />
        ) : (
          isHover && (
            <>
              <DownloadOutlined
                hidden={!(uploadFileDownloadableLink || downloadableLink)}
                className="flex-shrink-0 ml-2 pointer-cursor"
                onClick={async () => {
                  setIsDownloading(true)
                  const link =
                    uploadFileDownloadableLink ||
                    (await getFileDownloadableLink(`${downloadableLink}`, authToken, apiHost))
                  downloadFile(fileName, {
                    url: link,
                  })
                    .catch(() => {
                      message.error(formatMessage(messages.failedDownload))
                    })
                    .finally(() => {
                      setIsDownloading(false)
                    })
                }}
              />
              <CloseOutlined hidden={!onDelete} className="flex-shrink-0 ml-2 pointer-cursor" onClick={onDelete} />
            </>
          )
        )}
      </StyledFileItem>
      {!!uploadProgress && <Progress percent={uploadProgress} strokeColor="#4ed1b3" />}
    </>
  )
}

export default FileItem
