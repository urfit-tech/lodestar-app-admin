import { UploadOutlined } from '@ant-design/icons'
import { Button, message, Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload'
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface'
import axios, { Canceler } from 'axios'
import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useAuth } from '../../contexts/AuthContext'
import { uploadFile } from '../../helpers'

const messages = defineMessages({
  uploadSuccess: { id: 'upload.event.success', defaultMessage: '上傳成功' },
  uploadFailed: { id: 'upload.event.failed', defaultMessage: '上傳失敗' },
  uploading: { id: 'upload.event.uploading', defaultMessage: '上傳中' },
})

type MultipleUploaderProps = UploadProps & {
  isPublic?: boolean
  path: string
  uploadText?: string
  reUploadText?: string
  value?: UploadFile
  fileList: Array<any>
  setDataList?: any
  onCancel?: () => void
  onChange?: (value?: UploadFile) => void
  trigger?: (props: { loading: boolean; value?: UploadFile }) => React.ReactNode
  onUploading?: (info: UploadChangeParam<UploadFile>) => void
  onSuccess?: (info: UploadChangeParam<UploadFile>) => void
  onError?: (info: UploadChangeParam<UploadFile>) => void
  onRefetch?: () => void
}

const MultipleUploader: React.FC<MultipleUploaderProps> = ({
  isPublic,
  path,
  uploadText,
  reUploadText,
  value,
  fileList,
  setDataList,
  onCancel,
  onChange,
  trigger,
  onUploading,
  onSuccess,
  onError,
  onRefetch,
  ...uploadProps
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState<boolean>(false)
  const uploadCanceler = useRef<Canceler>()
  const { authToken } = useAuth()

  const duplicateName = (file: any) => {
    const fileName: string = file.name.substring(0, file.name.indexOf('.', 0))

    if (fileList.some((oldFile: any) => oldFile.data.name === file.name)) {
      if (file.name.match(/.*\(\d*\)\.[a-z]*/)) {
        return `${fileName}(${
          Math.max.apply(
            Math,
            fileList
              .filter((oldFile: any) => oldFile.data.name.match(/\((\d*)\)/))
              .map((oldFile: any) => oldFile.data.name.substring(0, oldFile.data.name.indexOf('.', 0)))
              .filter(
                (oldFile: any) =>
                  oldFile.data.name.substring(0, fileName.lastIndexOf('(')) ===
                  fileName.substring(0, fileName.lastIndexOf('(')),
              )
              .map((oldFile: any) => Number(oldFile.data.name.match(/\((\d*)\)/)[1] || 0)),
          ) === -Infinity
            ? 1
            : Math.max.apply(
                Math,
                fileList
                  .filter((oldFile: any) => oldFile.data.name.match(/\((\d*)\)/))
                  .map((oldFile: any) => oldFile.data.name.substring(0, oldFile.data.name.indexOf('.', 0)))
                  .filter(
                    (oldFile: any) =>
                      oldFile.data.name.substring(0, fileName.lastIndexOf('(')) ===
                      fileName.substring(0, fileName.lastIndexOf('(')),
                  )
                  .map((oldFile: any) => Number(oldFile.data.name.match(/\((\d*)\)/)[1] || 0)),
              ) + 1
        })${file.name.substring(file.name.indexOf('.', 0))}`
      } else {
        if (
          fileList.some(
            (oldFile: any) => oldFile.data.name === `${fileName}(1)${file.name.substring(file.name.indexOf('.', 0))}`,
          )
        ) {
          return `${fileName}(2)${file.name.substring(file.name.indexOf('.', 0))}`
        } else {
          return `${fileName}(1)${file.name.substring(file.name.indexOf('.', 0))}`
        }
      }
    } else {
      return `${fileName}${file.name.substring(file.name.indexOf('.', 0))}`
    }
  }

  const props: UploadProps = {
    ...uploadProps,
    multiple: true,
    onChange: info => {
      if (info.file.status === 'uploading') {
        onUploading && onUploading(info)
      } else {
        setLoading(false)
        if (info.file.status === 'done') {
          setDataList([...fileList, { data: { ...info.file, name: duplicateName(info.file) } }])
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
    customRequest: (option: any) => {
      const { file, onProgress, onError, onSuccess } = option
      setLoading(true)
      onChange && onChange(file)

      uploadFile(`${path}_${duplicateName(file)}`, file, authToken, {
        onUploadProgress: progressEvent => {
          onProgress({
            percent: (progressEvent.loaded / progressEvent.total) * 100,
          })
        },
        cancelToken: new axios.CancelToken(canceler => {
          uploadCanceler.current = canceler
        }),
      })
        .then(onSuccess)
        .catch(error => {
          console.log(error)
          onError(error)
        })
    },
  }

  return (
    <Upload {...props}>
      {trigger ? (
        trigger({ loading, value })
      ) : loading ? (
        <div>
          <div style={{ color: '#585858' }}>{formatMessage(messages.uploading)}</div>
        </div>
      ) : (
        <Button icon={<UploadOutlined />} loading={loading} disabled={loading}>
          {uploadText}
        </Button>
      )}
    </Upload>
  )
}
export default MultipleUploader
