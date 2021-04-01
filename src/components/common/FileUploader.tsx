import { UploadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import FileItem from './FileItem'

const StyledButtonWrapper = styled.div`
  margin-bottom: 10px;
`

const FileUploader: React.FC<{
  fileList: File[]
  multiple?: boolean
  showUploadList?: boolean
  accept?: string
  uploadProgress?: { [fileName: string]: number }
  downloadableLink?: string | ((file: File) => string)
  renderTrigger?: React.FC<{
    onClick: () => void
  }>
  onChange?: (files: File[]) => void
}> = ({ renderTrigger, multiple, accept, uploadProgress, fileList, showUploadList, onChange, downloadableLink }) => {
  const { formatMessage } = useIntl()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploadFilesDownloadableLink, setUploadFilesDownloadableLink] = useState<{ [fileName: string]: string }>({})

  return (
    <>
      <StyledButtonWrapper>
        {renderTrigger?.({ onClick: () => inputRef.current?.click() }) || (
          <Button icon={<UploadOutlined />} onClick={() => inputRef.current?.click()}>
            {formatMessage(commonMessages.ui.uploadFile)}
          </Button>
        )}
      </StyledButtonWrapper>
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
            setUploadFilesDownloadableLink(prev => ({ ...prev, [file.name]: URL.createObjectURL(file) }))
            file && !files.some(v => v.name === file.name) && files.push(file)
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
            downloadableLink={typeof downloadableLink === 'string' ? downloadableLink : downloadableLink?.(v)}
            uploadFileDownloadableLink={uploadFilesDownloadableLink[v.name]}
            uploadProgress={uploadProgress?.[v.name]}
            onDelete={() => onChange?.(fileList.filter(w => w.name !== v.name))}
          />
        ))}
    </>
  )
}

export default FileUploader
