import { DatabaseOutlined, RedoOutlined } from '@ant-design/icons'
import AwsS3Multipart from '@uppy/aws-s3-multipart'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/react'
import { Button, Input, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import axios from 'axios'
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
import { commonMessages } from '../../helpers/translation'
import { useAttachments } from '../../hooks/data'
import ForbiddenPage from '../ForbiddenPage'
import MediaLibraryUsageCard from './MediaLibraryUsageCard'

const MediaLibraryPage: React.FC = () => {
  const [uppy, setUppy] = useState<Uppy>()
  const [searchText, setSearchText] = useState('')
  const [activeTabKey, setActiveTabKey] = useQueryParam('tab', StringParam)
  const [defaultVisibleModal] = useQueryParam('open', StringParam)
  const { formatMessage } = useIntl()
  const { authToken, permissions, currentMemberId } = useAuth()
  const { id: appId } = useApp()
  const { attachments, loading: loadingAttachments, refetch: refetchAttachments } = useAttachments()

  const handleVideoAdd = useCallback(() => {
    setUppy(
      new Uppy({
        restrictions: {
          allowedFileTypes: ['video/*'],
          maxTotalFileSize: 10 * 1024 * 1024 * 1024, // limited 10GB at once
        },
      })
        .use(AwsS3Multipart, {
          retryDelays: undefined, // do not retry
          companionHeaders: { Authorization: `bearer ${authToken}` },
          companionUrl: `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage`,
          createMultipartUpload: async file => {
            const id = uuid()
            const key = `vod/${appId}/${id.substring(0, 2)}/${id}/video/${file.name}`
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
            const attachmentId = opts.key.split('/')[3]
            const completedUploadResponse = await axios.post(
              `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage/multipart/complete`,
              {
                params: { Key: opts.key, UploadId: opts.uploadId, MultipartUpload: { Parts: opts.parts } },
                file: { name: file.name, type: file.type, size: file.size },
                appId: appId,
                attachmentId,
                authorId: currentMemberId,
              },
              {
                headers: { authorization: `Bearer ${authToken}` },
              },
            )
            return { location: completedUploadResponse.data }
          },

          // removeFingerprintOnSuccess: true,
          // chunkSize: 10 * 1024 * 1024, // 10MB
          // endpoint: tusEndpoint,
          // onBeforeRequest: async req => {
          //   if (req.getURL() === tusEndpoint) {
          //     req.setHeader('Authorization', `bearer ${authToken}`)
          //   }
          // },
        })
        .on('complete', () => {
          refetchAttachments?.()
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
              className="mr-1"
              videoId={attachment.id}
              title={attachment.name}
              isExternalLink={!!attachment.data?.source}
              videoUrl={attachment?.data?.url}
            />
            <ReUploadButton
              videoId={attachment.id}
              isExternalLink={!!attachment.data?.source}
              onFinish={() => refetchAttachments?.()}
            />
          </div>
          <div className="d-flex">
            <CaptionUploadButton className="mr-1" videoId={attachment.id} isExternalLink={!!attachment.data?.source} />
            <DeleteButton
              videoId={attachment.id}
              isExternalLink={!!attachment.data?.source}
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
