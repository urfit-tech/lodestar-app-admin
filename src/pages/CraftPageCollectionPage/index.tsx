import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Tabs } from 'antd'
import gql from 'graphql-tag'
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
  const { loadingAppPages, appPages, refetchAppPages } = useAppPageCollection()
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
          editorName: appPage.editorName,
          craftData: appPage.craftData,
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
          editorName: appPage.editorName,
          craftData: appPage.craftData,
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
          onRefetch={refetchAppPages}
        />
      </div>

      <Tabs defaultActiveKey="published">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.pages.length})`}>
            <AdminPageBlock>
              <CraftPageCollectionTable
                pages={tabContent.pages}
                loading={loadingAppPages}
                onRefetch={refetchAppPages}
              />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export const CHECK_APP_PAGE_PATH = gql`
  query CHECK_APP_PAGE_PATH($path: String) {
    app_page(where: { path: { _eq: $path } }) {
      id
    }
  }
`

export default CraftPageCollectionPage
