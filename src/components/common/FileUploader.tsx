import { UploadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { downloadFile, getFileDownloadableLink, getFileDownloadableLinkV2 } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import FileItem from './FileItem'

const StyledButtonWrapper = styled.div`
  margin-bottom: 10px;
`

const FileUploader: React.FC<{
  fileList: File[]
  accept?: string
  multiple?: boolean
  showUploadList?: boolean
  failedUploadFiles?: File[]
  uploadProgress?: { [fileName: string]: number }
  downloadableLink?: string | ((file: File) => string)
  downloadableLinkV2?: {
    key: string
    prefix: string
  }
  renderTrigger?: React.FC<{
    onClick: () => void
  }>
  onChange?: (files: File[]) => void
  onDownload?: (files: File) => void
  downloadOnly?: boolean
}> = ({
  fileList,
  multiple,
  accept,
  uploadProgress,
  showUploadList,
  failedUploadFiles,
  downloadableLink,
  downloadableLinkV2,
  renderTrigger,
  onChange,
  onDownload,
  downloadOnly = false,
}) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  return (
    <>
      {!downloadOnly && (
        <StyledButtonWrapper>
          {renderTrigger?.({ onClick: () => inputRef.current?.click() }) || (
            <Button icon={<UploadOutlined />} onClick={() => inputRef.current?.click()}>
              {formatMessage(commonMessages.ui.uploadFile)}
            </Button>
          )}
        </StyledButtonWrapper>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        hidden
        onChange={e => {
          if (!e.target.files || !e.target.files.length || !onChange) {
            return
          }

          // append new file into input value
          const files: File[] = fileList?.slice() || []
          for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i]
            if (file && !files.some(v => v.name === file.name && v.lastModified === file.lastModified)) {
              setUploadFiles(prev => [...prev, file])
              files.push(file)
            }
          }
          e.target.value = ''
          e.target.files = null
          if (multiple) {
            return onChange(files)
          }
          onChange([...files.slice(-1)])
        }}
      />

      {showUploadList &&
        fileList.map(v => (
          <FileItem
            key={v.name}
            fileName={v.name}
            loadingProgress={uploadProgress?.[v.name]}
            isFailed={failedUploadFiles?.some(file => file.name === v.name && file.lastModified === v.lastModified)}
            onDownload={
              uploadFiles.every(file => file.name !== v.name && file.lastModified !== v.lastModified) &&
              downloadableLink
                ? async () => {
                    onDownload?.(v)
                    const link = await getFileDownloadableLink(
                      `${typeof downloadableLink === 'string' ? downloadableLink : downloadableLink?.(v)}`,
                      authToken,
                    )
                    return downloadFile(v.name, {
                      url: link,
                    })
                  }
                : downloadableLinkV2
                ? async () => {
                    onDownload?.(v)
                    const link = await getFileDownloadableLinkV2(
                      downloadableLinkV2.key,
                      downloadableLinkV2.prefix,
                      authToken,
                      appId,
                    )
                    return downloadFile(v.name, {
                      url: link,
                    })
                  }
                : undefined
            }
            onDelete={!downloadOnly ? () => onChange?.(fileList.filter(w => w.name !== v.name)) : undefined}
          />
        ))}
    </>
  )
}

export default FileUploader
