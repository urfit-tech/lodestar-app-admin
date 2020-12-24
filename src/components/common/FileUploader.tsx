import { UploadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'

const StyledFileItem = styled.div`
  color: var(--gray-darker);
  font-size: 14px;

  :hover {
    background-color: var(--gray-lighter);
  }
`

const FileUploader: React.FC<{
  fileList: File[]
  multiple?: boolean
  showUploadList?: boolean
  accept?: string
  onChange?: (files: File[]) => void
  renderTrigger?: React.FC<{
    onClick: () => void
  }>
}> = ({ renderTrigger, multiple, accept, onChange, fileList, showUploadList }) => {
  const { formatMessage } = useIntl()
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      {renderTrigger?.({ onClick: () => inputRef.current?.click() }) || (
        <Button icon={<UploadOutlined />} onClick={() => inputRef.current?.click()}>
          {formatMessage(commonMessages.ui.uploadFile)}
        </Button>
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
          <StyledFileItem key={v.name} className="d-flex align-items-center justify-content-between py-1 px-2">
            <div className="flex-grow-1">{v.name}</div>
            {/* <CloseButton
              className="flex-shrink-0 ml-2 pointer-cursor"
              onClick={() => onChange?.(fileList.filter(w => w.name !== v.name))}
            /> */}
          </StyledFileItem>
        ))}
    </>
  )
}

export default FileUploader
