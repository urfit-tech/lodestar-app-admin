import Icon, { FileAddOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParams } from 'use-query-params'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import { useAppPageCollection } from '../../hooks/appPage'
import { PageIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import CraftPageCollectionTable from './CraftPageCollectionTable'
import CraftPageCreationModal from './CraftPageCreationModal'

const CraftPageCollectionPage: React.VFC = () => {
  const [query] = useQueryParams({
    action: StringParam,
    pageName: StringParam,
    path: StringParam,
  })
  const { formatMessage } = useIntl()
  const { loadingAppPages, appPages, refetchAppPages } = useAppPageCollection()
  const [isModalVisible, setIsModalVisible] = useState(query.action === 'create')
  const { isAuthenticating, permissions } = useAuth()
  const { enabledModules } = useApp()

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      condition: {},
      pages: appPages
        .filter(appPage => appPage.publishedAt)
        .map(appPage => ({
          id: appPage.id,
          title: appPage.title || '',
          path: appPage.path,
          updatedAt: appPage.updatedAt,
          editorName: appPage.editorName,
          craftData: appPage.craftData,
          options: appPage.options,
          language: appPage.language,
        })),
    },
    {
      key: 'unpublished',
      tab: formatMessage(commonMessages.status.unpublished),
      pages: appPages
        .filter(appPage => !appPage.publishedAt)
        .map(appPage => ({
          id: appPage.id,
          title: appPage.title || '',
          path: appPage.path,
          updatedAt: appPage.updatedAt,
          editorName: appPage.editorName,
          craftData: appPage.craftData,
          options: appPage.options,
          language: appPage.language,
        })),
    },
  ]

  if (isAuthenticating) {
    return <LoadingPage />
  }

  if (!enabledModules.craft_page || (!permissions.CRAFT_PAGE_ADMIN && !permissions.CRAFT_PAGE_NORMAL)) {
    return <ForbiddenPage />
  }

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
          defaultStep={query.pageName && query.path ? 'template' : 'page'}
          defaultPageInfo={{ pageName: query.pageName || '', path: query.path || '' }}
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
