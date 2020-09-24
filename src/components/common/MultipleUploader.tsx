import { CloseOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, message, Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload'
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import axios, { Canceler } from 'axios'
import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { uploadFile } from '../../helpers'
import { commonMessages } from '../../helpers/translation'

const messages = defineMessages({
  uploadSuccess: { id: 'upload.event.success', defaultMessage: '上傳成功' },
  uploadFailed: { id: 'upload.event.failed', defaultMessage: '上傳失敗' },
})

const StyledCloseOutlines = styled(CloseOutlined)`
  color: 'gray-darker';

  &:hover {
    color: ${props => props.theme['@primary-color']};
  }
  &:active {
    color: 'gray-darker';
  }
`
const StyledFileBlock = styled.div`
  padding: 0.5rem;
  transition: background 0.2s ease-in-out;

  :hover {
    background: var(--gray-lighter);
  }
`

type MultipleUploaderProps = UploadProps & {
  path: string
  fileList: UploadFile[]
  onSetFileList: React.Dispatch<React.SetStateAction<any[]>>
  uploadText?: string
  value?: UploadFile
  onChange?: (value?: UploadFile) => void
  onUploading?: (info: UploadChangeParam<UploadFile>) => void
  onSuccess?: (info: UploadChangeParam<UploadFile>) => void
  onError?: (info: UploadChangeParam<UploadFile>) => void
  renderTrigger?: (props: { loading: boolean; value?: UploadFile }) => React.ReactNode
}

const MultipleUploader: React.FC<MultipleUploaderProps> = ({
  path,
  fileList,
  onSetFileList,
  uploadText,
  value,
  onChange,
  onUploading,
  onSuccess,
  onError,
  renderTrigger,
  ...uploadProps
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState<boolean>(false)
  const uploadCanceler = useRef<Canceler>()
  const { authToken } = useAuth()

  const duplicateName = (file: UploadFile) => {
    const getFileName = (fileName: string) => (/^([^.()]+)(.+)?$/.exec(fileName) || [])[1]
    const getFileFormat = (fileName: string) => fileName.substring(fileName.indexOf('.', 0))

    if (fileList.some(oldFile => oldFile.name === file.name)) {
      return `${getFileName(file.name)}(${
        Math.max(
          ...fileList
            .filter(oldFile => getFileFormat(oldFile.name) === getFileFormat(file.name))
            .filter(oldFile => getFileName(oldFile.name) === getFileName(file.name))
            .map(oldFile => (/\((\d*)\)/.exec(oldFile.name) || [])[1])
            .map(oldFileIndex => parseInt(oldFileIndex || '0')),
        ) + 1
      })${getFileFormat(file.name)}`
    }

    return file.name
  }

  const props: UploadProps = {
    multiple: true,
    showUploadList: false,
    onChange: info => {
      if (info.file.status === 'uploading') {
        return onUploading && onUploading(info)
      }

      setLoading(false)
      if (info.file.status === 'done') {
        onSetFileList([
          ...fileList,
          {
            ...info.file,
            name: duplicateName(info.file),
          },
        ])
        return onSuccess
          ? onSuccess(info)
          : message.success(`${info.file.name} ${formatMessage(messages.uploadSuccess)}`)
      }
      if (info.file.status === 'error') {
        return onError ? onError(info) : message.error(`${info.file.name} ${formatMessage(messages.uploadFailed)}`)
      }
    },
    customRequest: ({ file, onSuccess, onError }) => {
      setLoading(true)
      onChange && onChange(file)

      uploadFile(`${path}_${duplicateName(file)}`, file, authToken, {
        cancelToken: new axios.CancelToken(canceler => {
          uploadCanceler.current = canceler
        }),
      })
        .then(res => onSuccess(res, file))
        .catch(error => onError(error))
    },
    ...uploadProps,
  }

  return (
    <>
      <Upload {...props}>
        {renderTrigger ? (
          renderTrigger({ loading, value })
        ) : (
          <Button icon={<UploadOutlined />} loading={loading} disabled={loading}>
            {uploadText}
          </Button>
        )}
      </Upload>
      {fileList?.map(file => (
        <StyledFileBlock key={file.uid} className="d-flex align-items-center justify-content-between mt-4">
          <div>
            <span className="mr-2">{file.name}</span>
          </div>
          <StyledCloseOutlines
            className="cursor-pointer"
            onClick={() => {
              onSetFileList(fileList.filter(oldFile => oldFile.uid !== file.uid))
              message.success(formatMessage(commonMessages.ui.deleted))
            }}
          />
        </StyledFileBlock>
      ))}
    </>
  )
}
export default MultipleUploader
