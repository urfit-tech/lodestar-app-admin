import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import { useAppPageCollection } from '../../hooks/appPage'
import { PageIcon } from '../../images/icon'
import CraftPageCollectionTable from './CraftPageCollectionTable'
import CraftPageCreationModal from './CraftPageCreationModal'

const CraftPageCollectionPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { appPages } = useAppPageCollection()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      pages: appPages
        .filter(appPage => appPage.publishedAt)
        .map(appPage => ({
          id: appPage.id,
          title: appPage.title,
          path: appPage.path,
          updatedAt: appPage.updatedAt,
          editor: appPage.editorName,
        })),
    },
    {
      key: 'unpublished',
      tab: formatMessage(commonMessages.status.unpublished),
      pages: appPages
        .filter(appPage => !appPage.publishedAt)
        .map(appPage => ({
          id: appPage.id,
          title: appPage.title,
          path: appPage.path,
          updatedAt: appPage.updatedAt,
          editor: appPage.editorName,
        })),
    },
  ]

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <PageIcon />} />
          <span>{formatMessage(commonMessages.menu.pageSetup)}</span>
        </AdminPageTitle>
      </div>

      <div className="mb-4">
        <CraftPageCreationModal
          visible={isModalVisible}
          icon={<FileAddOutlined />}
          setModalVisible={setIsModalVisible}
        />
      </div>

      <Tabs defaultActiveKey="published">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.pages.length})`}>
            <AdminPageBlock>
              <CraftPageCollectionTable pages={tabContent.pages} />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CraftPageCollectionPage
