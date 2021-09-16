import { CloseOutlined } from '@ant-design/icons'
import { Button, Skeleton, Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminBlock, AdminHeader, AdminHeaderTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { useApp } from '../../contexts/AppContext'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useAppPage } from '../../hooks/appPage'
import CraftPageBasicSettingBlock from './CraftPageBasicSettingBlock'
import CraftPagePublishAdminBlock from './CraftPagePublishAdminBlock'
import CraftPageSettingBlock from './CraftPageSettingBlock'

const CraftPageAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { pageId } = useParams<{ pageId: string }>()
  const { host } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { appPage, loadingAppPage, errorAppPage, refetchAppPage } = useAppPage(pageId)

  if (!appPage || loadingAppPage || errorAppPage) {
    return <Skeleton active />
  }

  return (
    <>
      <AdminHeader>
        <Link to="/craft-page">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{appPage.title}</AdminHeaderTitle>

        <a href={`https://${host + appPage.path}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'editor'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="editor" tab={formatMessage(craftPageMessages.label.editPage)}>
            <CraftPageSettingBlock pageAdmin={appPage} onRefetch={refetchAppPage} />
          </Tabs.TabPane>
          <Tabs.TabPane key="general" tab={formatMessage(craftPageMessages.label.settings)}>
            <CraftPageBasicSettingBlock pageAdmin={appPage} onRefetch={refetchAppPage} />
          </Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(craftPageMessages.label.publish)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>
              <AdminBlock>
                <CraftPagePublishAdminBlock pageAdmin={appPage} onRefetch={refetchAppPage} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default CraftPageAdminPage
