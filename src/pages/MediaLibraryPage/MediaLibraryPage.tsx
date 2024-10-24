import { DatabaseOutlined, RedoOutlined } from '@ant-design/icons'
import AwsS3Multipart from '@uppy/aws-s3-multipart'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/react'
import { Button, Input, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { v4 as uuid } from 'uuid'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  CaptionUploadButton,
  DeleteButton,
  PreviewButton,
  ReUploadButton,
} from '../../components/library/VideoLibraryItem'
import { getVideoDuration } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useAttachments } from '../../hooks/data'
import ForbiddenPage from '../ForbiddenPage'
import MediaLibraryUsageCard from './MediaLibraryUsageCard'

export const configAwsS3MultipartUppy = ({
  authToken,
  appId,
  currentMemberId,
  autoProceed,
  maxNumberOfFiles,
  onCompleted,
  onUpload,
  origin,
}: {
  authToken: string
  appId: string
  currentMemberId: string
  autoProceed?: boolean
  maxNumberOfFiles?: number
  onCompleted?: () => void
  onUpload?: () => void
  origin?: { id: string; name: string }
}) =>
  new Uppy({
    autoProceed,
    restrictions: {
      maxNumberOfFiles,
      allowedFileTypes: ['video/*'],
      maxTotalFileSize: 10 * 1024 * 1024 * 1024, // limited 10GB at once
    },
  })
    .use(AwsS3Multipart, {
      retryDelays: undefined, // do not retry
      companionHeaders: { Authorization: `bearer ${authToken}` },
      companionUrl: `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage`,
      createMultipartUpload: async file => {
        const id = origin?.id || uuid()
        const key = `vod/${appId}/${id.substring(0, 2)}/${id}/video/${dayjs().format('YYYYMMDDHHmmss') + '_' + id}`

        const createResponse = await axios.post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage/multipart/create`,
          {
            params: { Key: key, ContentType: file.type },
          },
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
        const { uploadId } = createResponse.data
        return { uploadId, key }
      },

      signPart: async (file, opts) => {
        const presignResponse = await axios.post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage/multipart/sign-url`,
          {
            params: { Key: opts.key, UploadId: opts.uploadId, PartNumber: opts.partNumber },
          },
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
        const { presignedUrl } = presignResponse.data

        return { url: presignedUrl }
      },
      completeMultipartUpload: async (file, opts) => {
        const duration = await getVideoDuration(file.data as File)
        const attachmentId = origin?.id || opts.key.split('/')[3]
        const completedUploadResponse = await axios.post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage/multipart/complete`,
          {
            params: { Key: opts.key, UploadId: opts.uploadId, MultipartUpload: { Parts: opts.parts } },
            file: { name: file.name, type: file.type, size: file.size },
            appId: appId,
            attachmentId,
            attachmentName: origin?.name || file.name,
            authorId: currentMemberId,
            duration,
          },
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
        return { location: completedUploadResponse.data }
      },
    })
    .on('upload', () => {
      onUpload?.()
    })
    .on('complete', () => {
      onCompleted?.()
    })

const MediaLibraryPage: React.FC = () => {
  const [uppy, setUppy] = useState<Uppy>()
  const [searchText, setSearchText] = useState('')
  const [activeTabKey, setActiveTabKey] = useQueryParam('tab', StringParam)
  activeTabKey || setActiveTabKey('video')
  const [defaultVisibleModal] = useQueryParam('open', StringParam)
  const { formatMessage } = useIntl()
  const { authToken, permissions, currentMemberId } = useAuth()
  const { id: appId } = useApp()
  const {
    attachments,
    loading: loadingAttachments,
    refetch: refetchAttachments,
  } = useAttachments({ contentType: `${activeTabKey ?? 'video'}*` })

  const handleVideoAdd = useCallback(() => {
    authToken &&
      currentMemberId &&
      setUppy(
        configAwsS3MultipartUppy({
          authToken,
          appId,
          currentMemberId,
          onCompleted: () => {
            refetchAttachments?.()
          },
        }),
      )
  }, [authToken, refetchAttachments, appId])

  useEffect(() => {
    defaultVisibleModal === 'video' && handleVideoAdd()
  }, [defaultVisibleModal, handleVideoAdd])

  useEffect(() => {
    authToken && refetchAttachments?.()
  }, [authToken, refetchAttachments])

  const videoAttachmentColumns: ColumnProps<typeof attachments[number]>[] = [
    {
      key: 'actions',
      width: 0,
      render: (_, attachment) => (
        <div>
          <div className="d-flex mb-1">
            <PreviewButton
              key={`preview_${attachment.id}`}
              className="mr-1"
              title={attachment.name}
              isExternalLink={!!attachment.data?.source}
              videoUrl={
                attachment?.data?.url ||
                attachment.options?.cloudfront?.playPaths?.hls ||
                attachment.options?.cloudfront?.path
              }
              videoId={attachment.id}
              disabled={attachment.status !== 'READY'}
            />
            <ReUploadButton
              key={`re_upload_${attachment.id}`}
              videoId={attachment.id}
              videoName={attachment.name}
              isExternalLink={!!attachment.data?.source}
              onFinish={() => refetchAttachments?.()}
            />
          </div>
          <div className="d-flex">
            <CaptionUploadButton
              key={`caption_upload_${attachment.id}`}
              className="mr-1"
              videoId={attachment.id}
              videoUrl={
                attachment?.data?.url ||
                attachment.options?.cloudfront?.playPaths?.hls ||
                attachment.options?.cloudfront?.path
              }
              isExternalLink={!!attachment.data?.source}
            />
            <DeleteButton
              key={`delete_${attachment.id}`}
              videoId={attachment.id}
              onDelete={() => refetchAttachments?.()}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, attachment) => (
        <div>
          <div>{text}</div>
          <small>
            <span className="mr-1">{attachment.filename}</span>
            {attachment.author?.name ? '@' + attachment.author.name : ''}
          </small>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: duration => `${Math.ceil(Number(duration) / 60)} min(s)`,
    },
    {
      title: 'File size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: size => `${Math.ceil(Number(size) / 1024 / 1024)} MB`,
    },
    {
      title: 'Create time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: text => moment(text).format('MM/DD HH:mm'),
    },
    {
      title: 'Update time',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: text => moment(text).format('MM/DD HH:mm'),
    },
  ]

  if (!permissions.MEDIA_LIBRARY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DatabaseOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.mediaLibrary)}</span>
      </AdminPageTitle>
      <Tabs activeKey={activeTabKey || 'video'} onChange={key => setActiveTabKey(key)}>
        <Tabs.TabPane tab={formatMessage(commonMessages.ui.video)} key="video">
          <div className="d-flex justify-content-between">
            <div>
              <Button className="mb-2 mr-1" type="primary" onClick={handleVideoAdd}>
                <span className="mr-2">+</span>
                {formatMessage(commonMessages.ui.add)}
              </Button>
              <Button onClick={() => refetchAttachments?.()}>
                <RedoOutlined />
              </Button>
            </div>
            <Input
              style={{ width: '200px', height: '48px' }}
              placeholder="Search..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <div className="overflow-auto">
            <Table
              loading={loadingAttachments}
              columns={videoAttachmentColumns}
              dataSource={attachments
                .filter(attachment => attachment.name.includes(searchText) || attachment.filename.includes(searchText))
                .filter(attachment => attachment.contentType.startsWith('video/'))}
            />
          </div>
        </Tabs.TabPane>

        {/* <Tabs.TabPane tab={formatMessage(commonMessages.ui.image)} key="image">
          Content of Tab Pane 2
        </Tabs.TabPane> */}
        {/* <Tabs.TabPane tab={formatMessage(commonMessages.ui.other)} key="other">
          Content of Tab Pane 3
        </Tabs.TabPane> */}
      </Tabs>
      <MediaLibraryUsageCard />

      {uppy && (
        <DashboardModal
          uppy={uppy}
          open
          onRequestClose={() => setUppy(undefined)}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </AdminLayout>
  )
}

export default MediaLibraryPage
