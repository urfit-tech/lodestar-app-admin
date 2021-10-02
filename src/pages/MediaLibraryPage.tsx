import { BookOutlined } from '@ant-design/icons'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/react'
import Tus from '@uppy/tus'
import { Button, List, Tabs } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import VideoLibraryItem from '../components/library/VideoLibraryItem'
import { commonMessages } from '../helpers/translation'
import { useAttachments } from '../hooks/data'

const MediaLibrary: React.FC = () => {
  const [uppy, setUppy] = useState<Uppy>()
  const [activeTabKey, setActiveTabKey] = useQueryParam('tab', StringParam)
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { attachments, loading: loadingAttachments, refetch: refetchAttachments } = useAttachments()

  const handleVideoAdd = () => {
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
  }
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.mediaLibrary)}</span>
      </AdminPageTitle>
      <Tabs activeKey={activeTabKey || 'video'} onChange={key => setActiveTabKey(key)}>
        <Tabs.TabPane tab={formatMessage(commonMessages.ui.video)} key="video">
          <List
            header={
              <Button type="link" onClick={handleVideoAdd}>
                <span className="mr-2">+</span>
                {formatMessage(commonMessages.ui.add)}
              </Button>
            }
            itemLayout="vertical"
            dataSource={attachments.filter(attachment => attachment.contentType.startsWith('video/'))}
            renderItem={item => (
              <VideoLibraryItem
                id={item.id}
                name={item.name}
                filename={item.filename}
                author={item.author}
                size={item.size}
                options={item.options}
                createdAt={item.createdAt}
                updatedAt={item.updatedAt}
                onReUpload={() => refetchAttachments()}
              />
            )}
            loading={loadingAttachments}
          />
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
