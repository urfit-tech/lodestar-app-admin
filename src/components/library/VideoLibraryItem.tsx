import { DeleteOutlined, FileWordOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { Box, CircularProgress, CircularProgressLabel, Flex, Button as ChakraButton } from '@chakra-ui/react'
import Uppy from '@uppy/core'
import { StatusBar, useUppy } from '@uppy/react'
import Tus from '@uppy/tus'
import { Button, List, message, Modal, Select, Tag } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import { ModalProps } from 'antd/lib/modal'
import axios from 'axios'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import ReactPlayer from 'react-player'
import { DeepPick } from 'ts-deep-pick'
import { getFileDownloadableLink } from '../../helpers'
import { useCaptions, useMutateAttachment } from '../../hooks/data'
import { Attachment, UploadState } from '../../types/general'
import libraryMessages from './translation'
import VideoPlayer from './VideoPlayer'
import { CheckIcon } from '../../images/icon'

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

export const DeleteButton: React.VFC<
  { videoId: string; isExternalLink: boolean; onDelete?: () => void } & ButtonProps
> = ({ videoId, isExternalLink, onDelete, ...buttonProps }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const { deleteAttachments } = useMutateAttachment()

  const handleClick = () => {
    if (window.confirm('This action cannot be reverted.')) {
      setDeleting(true)
      if (isExternalLink) {
        deleteAttachments({ variables: { attachmentIds: [videoId] } })
          .then(() => {
            onDelete?.()
          })
          .catch(handleError)
          .finally(() => setDeleting(false))
      } else {
        axios
          .delete(`${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoId}`, {
            headers: {
              Authorization: `bearer ${authToken}`,
            },
          })
          .then(({ data: { code, error } }) => {
            if (code === 'SUCCESS') {
              onDelete?.()
            } else {
              alert(error)
            }
          })
          .finally(() => setDeleting(false))
      }
    }
  }
  return (
    <div>
      <Button
        title={formatMessage(libraryMessages.VideoLibraryItem.delete)}
        size="small"
        loading={deleting}
        danger
        onClick={handleClick}
        {...buttonProps}
        icon={<DeleteOutlined />}
      />
    </div>
  )
}

export const TitleBlock: React.VFC<{
  attachment: DeepPick<Attachment, 'id' | 'name' | 'data' | 'options' | 'filename' | '~author.name'>
  text: string
}> = ({ attachment, text }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  return (
    <div style={{ cursor: 'pointer' }}>
      <Modal title={attachment.name} footer={null} visible={isModalVisible} onCancel={() => setIsModalVisible(false)}>
        {!!attachment.data?.source ? (
          <ReactPlayer url={attachment.data.url} width="100%" controls />
        ) : (
          <VideoPlayer videoId={attachment.id} width="100%" />
        )}
      </Modal>
      <div onClick={() => setIsModalVisible(true)}>
        <div>{text}</div>
        <small>
          <span className="mr-1">{attachment.filename}</span>
          {attachment.author?.name ? '@' + attachment.author.name : ''}
        </small>
      </div>
    </div>
  )
}

export const DownloadButton: React.VFC<{
  className: string
  videoId: string
  isExternalLink: boolean
  options: Pick<Attachment, 'options'>
  fileName?: string
}> = ({ className, videoId, isExternalLink, options, fileName }) => {
  const theme = useAppTheme()
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentProcess, setCurrentProcess] = useState(0)

  const handleDownload = async () => {
    setIsModalVisible(true)
    if (options) {
      // cloudflare
      axios.post(``).then(({ data }) => {
        if (data.success) {
          const status = data.result.default.status
          const url = data.result.default.url
          const percentComplete = data.result.default.percentComplete
          setCurrentProcess(percentComplete)
        } else if (data.errors) {
          message.error(data.errors)
        } else {
          message.error(formatMessage(libraryMessages['*'].systemErrorText))
        }
      })
    } else if (fileName) {
      const url: string = await getFileDownloadableLink(`attachments/${videoId}`, authToken)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || ''
      link.click()
    } else {
      message.error(formatMessage(libraryMessages.VideoLibraryItem.downloadFileError))
    }
  }

  return (
    <div>
      <Modal footer={null} visible={isModalVisible} onCancel={() => setIsModalVisible(false)}>
        <Box py="40px" textAlign="center">
          <Flex justifyContent="center" alignItems="center">
            <CircularProgress
              min={0}
              max={100}
              value={currentProcess}
              color={currentProcess === 100 ? '#198754' : theme.colors.primary[500]}
              size="75px"
              thickness="0.5rem"
            >
              <CircularProgressLabel
                color={currentProcess === 100 ? '#198754' : '#585858'}
                d="flex"
                justifyContent="center"
                fontSize="1rem"
              >
                {currentProcess === 100 ? <CheckIcon fontSize="1rem" /> : `${currentProcess}%`}
              </CircularProgressLabel>
            </CircularProgress>
          </Flex>
          {currentProcess === 100 ? (
            <>
              <Box mt="1rem" lineHeight="24px">
                <Box>{formatMessage(libraryMessages['*'].finish)}</Box>
                {/* FIXME: change expired time */}
                <Box>{formatMessage(libraryMessages.VideoLibraryItem.expiredDate, { expiredDate: '2023-05-30' })}</Box>
              </Box>
              <ChakraButton
                mt="2rem"
                variant="ghost"
                border="1px solid #cdcdcd"
                borderRadius="4px"
                onClick={() => handleDownload()}
              >
                {formatMessage(libraryMessages['*'].downloadFile)}
              </ChakraButton>
            </>
          ) : (
            <Box mt="1rem" fontSize="16px">
              {formatMessage(libraryMessages.VideoLibraryItem.downloadingText)}
            </Box>
          )}
        </Box>
      </Modal>

      <Button
        disabled={isExternalLink}
        className={className}
        size="small"
        title={formatMessage(libraryMessages['*'].download)}
        type="primary"
        onClick={() => handleDownload()}
        icon={<DownloadOutlined />}
      />
    </div>
  )
}

export const CaptionUploadButton: React.VFC<{ videoId: string; isExternalLink: boolean } & ButtonProps> = ({
  videoId,
  isExternalLink,
  ...buttonProps
}) => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)

  return (
    <div>
      <Button
        size="small"
        disabled={isExternalLink}
        title={formatMessage(libraryMessages.VideoLibraryItem.reUpload)}
        onClick={() => setIsModalVisible(true)}
        {...buttonProps}
        icon={<FileWordOutlined />}
      />
      {isModalVisible && <CaptionModal videoId={videoId} onCancel={() => setIsModalVisible(false)} destroyOnClose />}
    </div>
  )
}

const CaptionModal: React.VFC<{ videoId: string } & ModalProps> = ({ videoId, ...modalProps }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { formatMessage } = useIntl()
  const { captions, captionLanguages, refetch: refetchCaptions, deleteCaption, addCaption, uppy } = useCaptions(videoId)
  const [languageCode, setLanguageCode] = useState<typeof captionLanguages[number]['code']>()
  return (
    <Modal visible footer={null} title={formatMessage(libraryMessages.VideoLibraryItem.manageCaption)} {...modalProps}>
      <div className="d-flex mb-2">
        {formatMessage(libraryMessages.VideoLibraryItem.uploadedCaptions)}：
        {captions.map(caption => (
          <Tag key={caption.language} className="mr-1" closable onClose={() => deleteCaption(caption.language)}>
            {caption.label}
          </Tag>
        ))}
      </div>
      <Select
        className="mb-2"
        style={{ width: '100%' }}
        showSearch
        allowClear
        placeholder={formatMessage(libraryMessages.VideoLibraryItem.chooseCaptionLanguage)}
        value={languageCode}
        onChange={code =>
          addCaption(code).then(() => {
            setLanguageCode('')
            refetchCaptions()
          })
        }
      >
        {captionLanguages.map(captionLanguage => (
          <Select.Option key={captionLanguage.code} value={captionLanguage.code}>
            {captionLanguage.name}
          </Select.Option>
        ))}
      </Select>
      {uppy && (
        <Button block onClick={() => inputRef.current?.click()}>
          {formatMessage(libraryMessages.VideoLibraryItem.chooseFile)}
        </Button>
      )}
      {uppy && (
        <input
          accept=".srt,.vtt"
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
      )}
      {uppy && <StatusBar uppy={uppy} hideUploadButton showProgressDetails />}
    </Modal>
  )
}

export const ReUploadButton: React.VFC<
  { videoId: string; isExternalLink: boolean; onFinish?: () => void } & ButtonProps
> = ({ videoId, isExternalLink, onFinish, ...buttonProps }) => {
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
      <Button
        size="small"
        disabled={uploadState === 'uploading' || isExternalLink}
        title={formatMessage(libraryMessages.VideoLibraryItem.reUpload)}
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
