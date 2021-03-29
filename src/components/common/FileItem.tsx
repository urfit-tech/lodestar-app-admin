import { CloseOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { message } from 'antd'
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
  file: File
  downloadableLink?: string
  onDelete?: () => void
}> = ({ file, downloadableLink, onDelete }) => {
  const { formatMessage } = useIntl()
  const { authToken, apiHost } = useAuth()
  const [isHover, setIsHover] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <StyledFileItem
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="d-flex align-items-center justify-content-between py-1 px-2"
    >
      <div className="flex-grow-1">{file.name}</div>
      {loading ? (
        <LoadingOutlined className="flex-shrink-0 ml-2 " />
      ) : (
        isHover && (
          <>
            {downloadableLink && (
              <DownloadOutlined
                className="flex-shrink-0 ml-2 pointer-cursor"
                onClick={async () => {
                  setLoading(true)
                  const link = await getFileDownloadableLink(downloadableLink, authToken, apiHost)
                  downloadFile(link, file.name)
                    .catch(() => {
                      message.error(formatMessage(messages.failedDownload))
                    })
                    .finally(() => setLoading(false))
                }}
              />
            )}
            {onDelete && <CloseOutlined className="flex-shrink-0 ml-2 pointer-cursor" onClick={onDelete} />}
          </>
        )
      )}
    </StyledFileItem>
  )
}

export default FileItem
