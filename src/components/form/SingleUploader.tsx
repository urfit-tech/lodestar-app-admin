import { UploadOutlined } from '@ant-design/icons'
import { Button, message, Spin, Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload'
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import axios, { Canceler } from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { extname } from 'path'
import { clone } from 'ramda'
import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { notEmpty, uploadFile } from '../../helpers'

const messages = defineMessages({
  uploadSuccess: { id: 'upload.event.success', defaultMessage: '上傳成功' },
  uploadFailed: { id: 'upload.event.failed', defaultMessage: '上傳失敗' },
  uploading: { id: 'upload.event.uploading', defaultMessage: '上傳中' },
  uploadRetry: { id: 'upload.label.retry', defaultMessage: '重新上傳' },
  uploadFile: { id: 'upload.label.uploadFile', defaultMessage: '上傳檔案' },
})

const StyledUpload = styled(Upload)`
  .ant-progress-bg {
    background: ${props => props.theme['@primary-color']};
  }
`

type SingleUploaderProps = UploadProps & {
  path: string
  value?: UploadFile
  isPublic?: boolean
  onChange?: (value?: UploadFile) => void
  trigger?: (props: { loading: boolean; value?: UploadFile }) => React.ReactNode
  uploadText?: string
  reUploadText?: string
  onCancel?: () => void
  onUploading?: (info: UploadChangeParam<UploadFile>) => void
  onSuccess?: (info: UploadChangeParam<UploadFile>) => void
  onError?: (info: UploadChangeParam<UploadFile>) => void
  withExtension?: boolean
  fileSizeLimitInfo?: { text: string; size: number }
}
const SingleUploader: React.FC<SingleUploaderProps> = ({
  path,
  value,
  onChange,
  trigger,
  uploadText,
  reUploadText,
  onUploading,
  onSuccess,
  onError,
  onCancel,
  isPublic,
  withExtension,
  fileSizeLimitInfo,
  fileList,
  ...uploadProps
}) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [loading, setLoading] = useState<boolean>(false)

  const props: UploadProps = {
    ...uploadProps,
    fileList: fileList || [value].filter(notEmpty),
    onChange: info => {
      if (info.file.name) {
        onChange && onChange(clone(info.file))
      }
      if (info.file.status === 'uploading') {
        onUploading && onUploading(info)
      } else {
        setLoading(false)
        if (info.file.status === 'done') {
          onSuccess ? onSuccess(info) : message.success(`${info.file.name} ${formatMessage(messages.uploadSuccess)}`)
        } else if (info.file.status === 'error') {
          onError ? onError(info) : message.error(`${info.file.name} ${formatMessage(messages.uploadFailed)}`)
        }
      }
    },
    onRemove: () => {
      setLoading(false)
      onCancel && onCancel()
      onChange && onChange(undefined)
      uploadCanceler.current && uploadCanceler.current()
    },
    customRequest: option => {
      const { file, onProgress, onError, onSuccess } = option
      setLoading(true)

      // file size limit
      if (fileSizeLimitInfo && file.size > fileSizeLimitInfo.size) {
        message.error(fileSizeLimitInfo.text)
        setLoading(false)
        return
      }

      uploadFile(withExtension ? path + extname(file.name) : path, file, authToken, {
        onUploadProgress: progressEvent => {
          onProgress(
            {
              percent: (progressEvent.loaded / progressEvent.total) * 100,
            },
            file,
          )
        },
        cancelToken: new axios.CancelToken(canceler => {
          uploadCanceler.current = canceler
        }),
      })
        .then(({ data: response }) => {
          onSuccess(response, file)
        })
        .catch(error => {
          onError(error)
        })
        .finally(() => {
          setLoading(false)
        })
    },
  }
  return (
    <StyledUpload {...props}>
      {trigger ? (
        trigger({ loading, value })
      ) : loading ? (
        <div>
          <Spin />
          <div style={{ color: '#585858' }}>{formatMessage(messages.uploading)}</div>
        </div>
      ) : (
        <Button icon={<UploadOutlined />} loading={loading} disabled={loading}>
          {value
            ? reUploadText || formatMessage(messages.uploadRetry)
            : uploadText || formatMessage(messages.uploadFile)}
        </Button>
      )}
    </StyledUpload>
  )
}

export default SingleUploader
