import { Button, message, Spin, Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload'
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import axios, { Canceler } from 'axios'
import { extname } from 'path'
import React, { useRef, useState } from 'react'
import { uploadFile } from '../../helpers'

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
}
const SingleUploader: React.FC<SingleUploaderProps> = (
  {
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
    ...uploadProps
  },
  ref,
) => {
  const [loading, setLoading] = useState()
  const uploadCanceler = useRef<Canceler>()
  const props: UploadProps = {
    ...uploadProps,
    fileList: value ? [value] : [],
    onChange: info => {
      onChange && onChange(info.file)
      if (info.file.status === 'uploading') {
        onUploading && onUploading(info)
      } else {
        setLoading(false)
        if (info.file.status === 'done') {
          onSuccess ? onSuccess(info) : message.success(`${info.file.name} 上傳成功`)
        } else if (info.file.status === 'error') {
          onError ? onError(info) : message.error(`${info.file.name} 上傳失敗`)
        }
      }
    },
    onRemove: () => {
      setLoading(false)
      onCancel && onCancel()
      onChange && onChange(undefined)
      uploadCanceler.current && uploadCanceler.current()
    },
    customRequest: (option: any) => {
      const { file, onProgress, onError, onSuccess } = option
      setLoading(true)
      onChange && onChange(file)
      uploadFile(
        path + extname(file.name),
        file,
        {
          onUploadProgress: progressEvent => {
            onProgress({
              percent: (progressEvent.loaded / progressEvent.total) * 100,
            })
          },
          cancelToken: new axios.CancelToken(canceler => {
            uploadCanceler.current = canceler
          }),
        },
        isPublic,
      )
        .then(onSuccess)
        .catch(onError)
    },
  }
  return (
    <Upload {...props}>
      {trigger ? (
        trigger({ loading, value })
      ) : loading ? (
        <div>
          <Spin />
          <div style={{ color: '#585858' }}>上傳中</div>
        </div>
      ) : (
        <Button icon="upload" loading={loading} disabled={loading}>
          {value ? reUploadText || '重新上傳' : uploadText || '上傳檔案'}
        </Button>
      )}
    </Upload>
  )
}

export default React.forwardRef(SingleUploader)
