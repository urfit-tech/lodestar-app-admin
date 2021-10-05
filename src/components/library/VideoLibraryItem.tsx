import Uppy from '@uppy/core'
import { FileInput, StatusBar, useUppy } from '@uppy/react'
import Tus from '@uppy/tus'
import XHRUpload from '@uppy/xhr-upload'
import { Button, List, Modal, Select } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { DeepPick } from 'ts-deep-pick/lib'
import { Attachment, UploadState } from '../../types/general'
import VideoPlayer from './VideoPlayer'

const messages = defineMessages({
  preview: { id: 'program.ui.preview', defaultMessage: '預覽' },
  reUpload: { id: 'program.ui.reUpload', defaultMessage: '重新上傳' },
  uploadCaption: { id: 'program.ui.uploadCaption', defaultMessage: '上傳字幕' },
  duration: { id: 'program.label.duration', defaultMessage: '內容時長（分鐘）' },
  chooseCaptionLanguage: { id: 'program.label.chooseCaptionLanguage', defaultMessage: '選擇字幕語系' },
})
const captionLanguages = [
  { code: 'zh', name: 'Mandarin Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'de', name: 'German' },
  { code: 'pa', name: 'Panjabi' },
  { code: 'jv', name: 'Javanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'fr', name: 'French' },
  { code: 'ur', name: 'Urdu' },
  { code: 'it', name: 'Italian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'my', name: 'Burmese' },
  { code: 'th', name: 'Thai' },
]

const VideoLibraryItem: React.VFC<
  Pick<Attachment, 'id' | 'name'> &
    Partial<Omit<Attachment, 'author'>> &
    DeepPick<Attachment, 'author.name'> & {
      onReUpload?: () => void
      onCaptionUpload?: () => void
    }
> = ({
  id,
  name,
  filename,
  size,
  author,
  thumbnailUrl,
  contentType,
  createdAt,
  updatedAt,
  options,
  onReUpload,
  onCaptionUpload,
}) => {
  const { authToken } = useAuth()
  const [cloudflareOptions, setCloudflareOptions] = useState(options?.cloudflare)
  useEffect(() => {
    authToken &&
      axios
        .post(
          `${process.env.REACT_APP_API_BASE_ROOT}/videos/${id}/sync`,
          {},
          {
            headers: {
              Authorization: `bearer ${authToken}`,
            },
          },
        )
        .then(({ data: { code, result } }) => {
          if (code === 'SUCCESS') {
            setCloudflareOptions(result.cloudflareOptions)
          }
        })
  }, [authToken, id])
  return (
    <List.Item
      className="mb-3"
      extra={[
        <PreviewButton block className="mb-1" videoId={id} title={name} />,
        <ReUploadButton block className="mb-1" videoId={id} onFinish={onReUpload} />,
        <CaptionUploadButton block videoId={id} onFinish={onCaptionUpload} />,
      ]}
    >
      <List.Item.Meta
        title={name}
        description={`${(size ? (size / 1024 / 1024).toFixed(1) : '-') + 'MB'} @${author?.name}`}
      />
      <div>
        <div>filename: {filename}</div>
        <div>duration: {Math.ceil(Number(cloudflareOptions?.duration) / 60)} minute(s)</div>
        <div>Created: {createdAt}</div>
        <div>Updated: {updatedAt}</div>
      </div>
    </List.Item>
  )
}

const PreviewButton: React.VFC<{ videoId: string; title: string } & ButtonProps> = ({
  videoId,
  title,
  ...buttonProps
}) => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)
  return (
    <div>
      <Modal title={title} footer={null} visible={isModalVisible} onCancel={() => setIsModalVisible(false)}>
        <VideoPlayer videoId={videoId} width="100%" />
      </Modal>
      <Button type="primary" onClick={() => setIsModalVisible(true)} {...buttonProps}>
        {formatMessage(messages.preview)}
      </Button>
    </div>
  )
}

const CaptionUploadButton: React.VFC<{ videoId: string; onFinish?: () => void } & ButtonProps> = ({
  videoId,
  onFinish,
  ...buttonProps
}) => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [languageCode, setLanguageCode] = useState<typeof captionLanguages[number]['code']>()
  const uppy = useMemo(() => {
    return new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['text/vtt', 'text/srt'],
        maxTotalFileSize: 10 * 1024 * 1024, // limited 10MB at once
      },
    })
      .use(XHRUpload, {
        endpoint: `${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoId}/captions/${languageCode}`,
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      })
      .on('complete', () => {
        onFinish?.()
      })
  }, [authToken, languageCode, onFinish, videoId])
  return (
    <div>
      <Button onClick={() => setIsModalVisible(true)} {...buttonProps}>
        {formatMessage(messages.uploadCaption)}
      </Button>
      <Modal
        footer={null}
        title={formatMessage(messages.uploadCaption)}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      >
        <Select style={{ width: '100%' }} showSearch value={languageCode} onChange={code => setLanguageCode(code)}>
          {captionLanguages.map(captionLanguage => (
            <Select.Option key={captionLanguage.code} value={captionLanguage.code}>
              {captionLanguage.name}
            </Select.Option>
          ))}
        </Select>
        {languageCode && <FileInput uppy={uppy} pretty inputName="caption" />}
        <StatusBar uppy={uppy} showProgressDetails />
      </Modal>
    </div>
  )
}

const ReUploadButton: React.VFC<{ videoId: string; onFinish?: () => void } & ButtonProps> = ({
  videoId,
  onFinish,
  ...buttonProps
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const uppy = useUppy(() => {
    const tusEndpoint = `${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoId}/stream`
    return new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['video/*'],
        maxTotalFileSize: 10 * 1024 * 1024 * 1024, // limited 10GB at once
      },
    })
      .use(Tus, {
        removeFingerprintOnSuccess: true,
        chunkSize: 10 * 1024 * 1024, // 10MB
        endpoint: tusEndpoint,
        onBeforeRequest: req => {
          if (req.getURL() === tusEndpoint) {
            req.setHeader('Authorization', `bearer ${authToken}`)
          }
        },
      })
      .on('upload', () => setUploadState('uploading'))
      .on('complete', () => {
        onFinish?.()
        setUploadState('upload-success')
      })
  })
  return (
    <div>
      <Button disabled={uploadState === 'uploading'} onClick={() => inputRef.current?.click()} {...buttonProps}>
        {formatMessage(messages.reUpload)}
      </Button>
      <input
        accept="video/*"
        ref={inputRef}
        type="file"
        hidden
        onChange={e => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) {
            uppy.reset()
          }
          files.forEach(file => {
            try {
              uppy.addFile({
                source: 'file input',
                name: file.name,
                type: file.type,
                data: file,
              })
            } catch (err: any) {
              if (err.isRestriction) {
                // handle restrictions
                alert('Restriction error:' + err)
              } else {
                // handle other errors
                console.error(err)
              }
            }
          })
        }}
      />
      <StatusBar uppy={uppy} hideUploadButton hideAfterFinish />
    </div>
  )
}

export default VideoLibraryItem
