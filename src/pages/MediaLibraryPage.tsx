import { DatabaseOutlined } from '@ant-design/icons'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/react'
import Tus from '@uppy/tus'
import { Button, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import {
  CaptionUploadButton,
  DeleteButton,
  PreviewButton,
  ReUploadButton,
} from '../components/library/VideoLibraryItem'
import { commonMessages } from '../helpers/translation'
import { useAttachments } from '../hooks/data'

const MediaLibrary: React.FC = () => {
  const { settings } = useApp()
  const [uppy, setUppy] = useState<Uppy>()
  const [activeTabKey, setActiveTabKey] = useQueryParam('tab', StringParam)
  const [defaultVisibleModal] = useQueryParam('open', StringParam)
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const {
    totalDuration,
    totalSize,
    maxDuration,
    maxSize,
    attachments,
    loading: loadingAttachments,
    refetch: refetchAttachments,
  } = useAttachments()

  const [synchronizing, setSynchronizing] = useState(false)
  useEffect(() => {
    setSynchronizing(true)
    axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/videos/sync`,
        {},
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      )
      .then(({ data: { code, result, error } }) => {
        if (code === 'SUCCESS') {
          refetchAttachments()
        }
      })
      .finally(() => setSynchronizing(false))
  }, [authToken, refetchAttachments])
  const handleVideoAdd = useCallback(() => {
    const tusEndpoint = `${process.env.REACT_APP_API_BASE_ROOT}/videos/`
    setUppy(
      new Uppy({
        restrictions: {
          allowedFileTypes: ['video/*'],
          maxTotalFileSize: 10 * 1024 * 1024 * 1024, // limited 10GB at once
        },
      })
        .use(Tus, {
          retryDelays: undefined, // do not retry
          removeFingerprintOnSuccess: true,
          chunkSize: 10 * 1024 * 1024, // 10MB
          endpoint: tusEndpoint,
          onBeforeRequest: req => {
            if (req.getURL() === tusEndpoint) {
              req.setHeader('Authorization', `bearer ${authToken}`)
            }
          },
        })
        .on('complete', () => {
          refetchAttachments()
        }),
    )
  }, [authToken, refetchAttachments])

  useEffect(() => {
    defaultVisibleModal === 'video' && handleVideoAdd()
  }, [defaultVisibleModal, handleVideoAdd])

  const videoAttachmentColumns: ColumnProps<typeof attachments[number]>[] = [
    {
      key: 'actions',
      width: 0,
      render: (_, attachment) => (
        <div>
          <div className="d-flex mb-1">
            <PreviewButton className="mr-1" videoId={attachment.id} title={attachment.name} />
            <ReUploadButton videoId={attachment.id} onFinish={() => refetchAttachments()} />
          </div>
          <div className="d-flex">
            <CaptionUploadButton className="mr-1" videoId={attachment.id} />
            <DeleteButton videoId={attachment.id} onDelete={() => refetchAttachments()} />
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
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DatabaseOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.mediaLibrary)}</span>
      </AdminPageTitle>
      <div>
        <div>
          Size: {Math.ceil(totalSize / 1024 / 1024)}MB / {settings['quota.storage']}MB (Maximum:{' '}
          {Math.ceil(maxSize / 1024 / 1024)}MB)
        </div>
        <div>
          Duration: {Math.ceil(totalDuration / 60)}minutes / {settings['quota.duration']}minutes (Maximum:{' '}
          {Math.ceil(maxDuration / 60)}minutes)
        </div>
      </div>
      <Tabs activeKey={activeTabKey || 'video'} onChange={key => setActiveTabKey(key)}>
        <Tabs.TabPane tab={formatMessage(commonMessages.ui.video)} key="video">
          <Button className="mb-2" type="primary" onClick={handleVideoAdd}>
            <span className="mr-2">+</span>
            {formatMessage(commonMessages.ui.add)}
          </Button>
          <div className="overflow-auto">
            <Table
              loading={synchronizing || loadingAttachments}
              columns={videoAttachmentColumns}
              dataSource={attachments.filter(attachment => attachment.contentType.startsWith('video/'))}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={formatMessage(commonMessages.ui.image)} key="image">
          Content of Tab Pane 2
        </Tabs.TabPane>
        <Tabs.TabPane tab={formatMessage(commonMessages.ui.other)} key="other">
          Content of Tab Pane 3
        </Tabs.TabPane>
      </Tabs>
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

export default MediaLibrary
