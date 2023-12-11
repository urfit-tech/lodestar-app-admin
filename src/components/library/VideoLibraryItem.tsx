import { DeleteOutlined, EyeOutlined, FileWordOutlined, UploadOutlined } from '@ant-design/icons'
import { StatusBar, useUppy } from '@uppy/react'
import { Button, List, Modal, Select, Tag, Upload } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import { ModalProps } from 'antd/lib/modal'
import axios from 'axios'
import { last } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ReactPlayer from 'react-player'
import { DeepPick } from 'ts-deep-pick'
import { commonMessages } from '../../helpers/translation'
import { useCaptions, useMutateAttachment } from '../../hooks/data'
import { configAwsS3MultipartUppy } from '../../pages/MediaLibraryPage/MediaLibraryPage'
import { Attachment, UploadState } from '../../types/general'
import VideoPlayer from './VidoePlayer'

const messages = defineMessages({
  preview: { id: 'program.ui.preview', defaultMessage: '預覽' },
  reUpload: { id: 'program.ui.reUpload', defaultMessage: '重新上傳' },
  chooseFile: { id: 'program.ui.chooseFile', defaultMessage: '選擇檔案' },
  manageCaption: { id: 'program.ui.manageCaption', defaultMessage: '管理字幕' },
  uploadCaptions: { id: 'program.ui.uploadCaptions', defaultMessage: '上傳字幕' },
  uploadedCaptions: { id: 'program.ui.uploadedCaptions', defaultMessage: '已上傳字幕' },
  delete: { id: 'program.ui.delete', defaultMessage: '刪除檔案' },
  duration: { id: 'program.label.duration', defaultMessage: '內容時長（分鐘）' },
  chooseCaptionLanguage: { id: 'program.label.chooseCaptionLanguage', defaultMessage: '選擇字幕語系' },
})

const VideoLibraryItem: React.VFC<
  Pick<Attachment, 'id' | 'name'> &
    Partial<Omit<Attachment, 'author'>> &
    DeepPick<Attachment, 'author.name'> & {
      onReUpload?: () => void
      onDelete?: () => void
    }
> = ({
  id,
  name,
  filename,
  size,
  author,
  status,
  thumbnailUrl,
  contentType,
  duration,
  createdAt,
  updatedAt,
  options,
  onReUpload,
  onDelete,
}) => {
  const { authToken } = useAuth()
  const [cloudflareOptions, setCloudflareOptions] = useState(options?.cloudflare)

  return (
    <List.Item className="mb-3" extra={[]}>
      <List.Item.Meta
        title={name}
        description={`${(size ? (size / 1024 / 1024).toFixed(1) : '-') + 'MB'} @${author?.name}`}
      />
      <div>
        <div>status: {status}</div>
        <div>filename: {filename}</div>
        <div>duration: {Math.ceil(Number(duration) / 60)} minute(s)</div>
        <div>Created: {createdAt}</div>
        <div>Updated: {updatedAt}</div>
      </div>
    </List.Item>
  )
}

export const DeleteButton: React.VFC<{ videoId: string; onDelete?: () => void } & ButtonProps> = ({
  videoId,
  onDelete,
  ...buttonProps
}) => {
  const { formatMessage } = useIntl()
  const [deleting, setDeleting] = useState(false)
  const { deleteAttachments } = useMutateAttachment()

  const handleClick = () => {
    if (window.confirm('This action cannot be reverted.')) {
      setDeleting(true)
      deleteAttachments({ variables: { attachmentIds: [videoId] } })
        .then(() => {
          onDelete?.()
        })
        .catch(handleError)
        .finally(() => setDeleting(false))
    }
  }
  return (
    <>
      <Button
        title={formatMessage(messages.delete)}
        size="small"
        loading={deleting}
        danger
        onClick={handleClick}
        {...buttonProps}
        icon={<DeleteOutlined />}
      />
    </>
  )
}

export const PreviewButton: React.VFC<
  { videoId: string; title: string; isExternalLink: boolean; videoUrl?: string } & ButtonProps
> = ({ videoId, title, isExternalLink, videoUrl, ...buttonProps }) => {
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [sources, setSources] = useState<{ src: string; type: string }[]>([])
  const [captions, setCaptions] = useState<string[]>([])

  useEffect(() => {
    if (isModalVisible) {
      if (isExternalLink || !videoUrl) {
        setLoading(false)
        return
      }

      const url = videoUrl.includes('hls') ? `${videoUrl.split('hls')[0]}*` : `${videoUrl.split('manifest')[0]}*`
      axios
        .post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/auth/sign-cloudfront-url`,
          {
            url,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        .then(({ data }) => {
          const search = new URL(data.result).search
          const pathname = new URL(videoUrl).pathname
          setSources([
            {
              type: 'application/x-mpegURL',
              src: `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/videos${pathname}${search}`,
            },
          ])
        })
        .catch(error => console.log(error.toString()))
        .finally(() => setLoading(false))
      // getCaptions
      const captionsPath = videoUrl.includes('hls')
        ? url.replace('output', 'captions')
        : url.replace('manifest', 'text')
      axios
        .post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/auth/sign-cloudfront-url`,
          {
            url: `${captionsPath}`,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        .then(({ data }) => {
          const search = new URL(data.result).search
          axios
            .get(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/videos/${videoId}/captions`, {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            })
            .then(response => {
              const urls = response.data.result
              const signedUrls = urls.map((key: any) => `${key}${search}`)
              setCaptions(signedUrls)
            })
        })
        .catch(error => console.log(error))
        .finally(() => setLoading(false))
    }
  }, [isModalVisible, isExternalLink, videoUrl])
  return (
    <>
      <Modal
        title={title}
        footer={null}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setLoading(true)
        }}
      >
        {!loading &&
          (isExternalLink ? (
            <ReactPlayer url={videoUrl} width="100%" controls />
          ) : videoUrl ? (
            <VideoPlayer sources={sources} captions={captions} />
          ) : (
            <div>error when play video</div>
          ))}
      </Modal>
      <Button
        size="small"
        title={formatMessage(commonMessages.ui.preview)}
        type="primary"
        onClick={() => setIsModalVisible(true)}
        {...buttonProps}
        icon={<EyeOutlined />}
      />
    </>
  )
}

export const CaptionUploadButton: React.VFC<
  { videoId: string; isExternalLink: boolean; videoUrl: string } & ButtonProps
> = ({ videoId, isExternalLink, videoUrl, ...buttonProps }) => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)

  return (
    <>
      <Button
        size="small"
        disabled={isExternalLink}
        title={formatMessage(messages.reUpload)}
        onClick={() => setIsModalVisible(true)}
        {...buttonProps}
        icon={<FileWordOutlined />}
      />
      {isModalVisible && (
        <CaptionModal videoId={videoId} videoUrl={videoUrl} onCancel={() => setIsModalVisible(false)} destroyOnClose />
      )}
    </>
  )
}

const CaptionModal: React.VFC<{ videoId: string; videoUrl: string } & ModalProps> = ({
  videoId,
  videoUrl,
  ...modalProps
}) => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const { captions, captionLanguages, refetchCaption, deleteCaption } = useCaptions(videoId)
  const [languageCode, setLanguageCode] = useState<typeof captionLanguages[number]['srclang']>()
  return (
    <Modal visible footer={null} title={formatMessage(messages.manageCaption)} {...modalProps}>
      <div className="d-flex mb-2">
        {formatMessage(messages.uploadedCaptions)}：
        {captions.map(caption => (
          <Tag key={caption.language} className="mr-1" closable onClose={() => deleteCaption(caption.srclang)}>
            {caption.label}
          </Tag>
        ))}
      </div>
      <Select
        className="mb-2"
        style={{ width: '100%' }}
        showSearch
        allowClear
        placeholder={formatMessage(messages.chooseCaptionLanguage)}
        value={languageCode}
        onChange={code => setLanguageCode(code)}
      >
        {captionLanguages.map(captionLanguage => (
          <Select.Option key={captionLanguage.srclang} value={captionLanguage.srclang}>
            {captionLanguage.label}
          </Select.Option>
        ))}
      </Select>
      {languageCode && (
        <Upload
          accept=".vtt"
          customRequest={async ({ file, onSuccess, onError }) => {
            const url = videoUrl.includes('output')
              ? `${videoUrl.split('output')[0]}captions/${languageCode}.${last(file.name.split('.'))}`
              : `${videoUrl.split('manifest')[0]}text/${languageCode}.${last(file.name.split('.'))}`
            const key = new URL(url).pathname.substring(1)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('key', key)
            await axios
              .post(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/videos/${videoId}/captions`, formData, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'multipart/form-data',
                },
              })
              .then(res => {
                onSuccess(res, file)
                refetchCaption()
              })
              .catch(error => onError(error))
          }}
        >
          <Button block>{formatMessage(messages.chooseFile)}</Button>
        </Upload>
      )}
    </Modal>
  )
}

export const ReUploadButton: React.VFC<
  { videoId: string; videoName: string; isExternalLink: boolean; onFinish?: () => void } & ButtonProps
> = ({ videoId, videoName, isExternalLink, onFinish, ...buttonProps }) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const { authToken, currentMemberId } = useAuth()
  const { id: appId } = useApp()
  const { formatMessage } = useIntl()
  const uppy = useUppy(() => {
    return configAwsS3MultipartUppy({
      authToken: authToken || '',
      appId,
      currentMemberId: currentMemberId || '',
      onCompleted: () => {
        onFinish?.()
        setUploadState('upload-success')
      },
      onUpload: () => {
        setUploadState('uploading')
      },
      autoProceed: true,
      maxNumberOfFiles: 1,
      origin: { id: videoId, name: videoName },
    })
  })
  return (
    <>
      <Button
        size="small"
        disabled={uploadState === 'uploading' || isExternalLink}
        title={formatMessage(messages.reUpload)}
        onClick={() => inputRef.current?.click()}
        {...buttonProps}
        icon={<UploadOutlined />}
      />
      <input
        accept="video/*"
        ref={inputRef}
        type="file"
        hidden
        onChange={e => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) {
            uppy.resetProgress()
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
    </>
  )
}

export default VideoLibraryItem
