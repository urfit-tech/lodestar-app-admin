import { CloseOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../../components/admin'
import CraftPageBasicSettingBlock from '../../../components/craft/CraftPageBasicSettingBlock'
import CraftPagePublishAdminBlock from '../../../components/craft/CraftPagePublishAdminBlock'
import CraftPageSettingBlock from '../../../components/craft/CraftPageSettingBlock'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import { useApp } from '../../../contexts/AppContext'
import { commonMessages, craftPageMessages } from '../../../helpers/translation'

const CraftPageAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  //TODO: get page data
  const page = { id: '123', pageName: 'pageName', path: '', publishedAt: null }

  return (
    <>
      <AdminHeader>
        <Link to="/admin/craft_page">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{formatMessage(craftPageMessages.label.pageEditor)}</AdminHeaderTitle>

        <a href={`https://${settings['host']}`} target="_blank" rel="noopener noreferrer">
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
            <CraftPageSettingBlock />
          </Tabs.TabPane>
          <Tabs.TabPane key="general" tab={formatMessage(craftPageMessages.label.settings)}>
            <CraftPageBasicSettingBlock pageAdmin={page} />
          </Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(craftPageMessages.label.publish)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>
              <AdminBlock>
                <CraftPagePublishAdminBlock pageAdmin={page} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default CraftPageAdminPage
