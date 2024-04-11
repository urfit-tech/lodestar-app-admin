import { CloseOutlined } from '@ant-design/icons'
import { Editor } from '@craftjs/core'
import { Button, message, Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminBlock, AdminHeader, AdminHeaderTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../components/admin'
import { useResolver } from '../../components/craft/CraftResolver'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useAppPage, useMutateAppPage } from '../../hooks/appPage'
import CraftPageBasicSettingBlock from './CraftPageBasicSettingBlock'
import CraftPageBuilderBlock from './CraftPageBuilderBlock'
import { CraftPageBuilderProvider } from './CraftPageBuilderContext'
import CraftPageBuilderController from './CraftPageBuilderController'
import CraftPagePublishAdminBlock from './CraftPagePublishAdminBlock'

const CraftPageAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { pageId } = useParams<{ pageId: string }>()
  const { host } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { appPage, loadingAppPage, errorAppPage, refetchAppPage } = useAppPage(pageId)
  const [loading, setLoading] = useState(false)
  const { currentMemberId } = useAuth()
  const { updateAppPage } = useMutateAppPage()
  const resolver = useResolver()

  const handleSave = (
    serializedData: string,
    callbacks?: { onSuccess?: () => void; onFailure?: (error: Error) => void },
  ) => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId,
      editorId: currentMemberId,
      craftData: JSON.parse(serializedData),
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        callbacks?.onSuccess?.()
      })
      .catch(error => {
        handleError(error)
        callbacks?.onFailure?.(error)
      })
      .finally(() => setLoading(false))
  }

  if (!appPage || loadingAppPage || errorAppPage) {
    return <Skeleton active />
  }

  return (
    <Editor resolver={resolver}>
      <CraftPageBuilderProvider>
        <AdminHeader>
          <Link to="/craft-page">
            <Button type="link" className="mr-3">
              <CloseOutlined />
            </Button>
          </Link>

          <AdminHeaderTitle>{appPage.title}</AdminHeaderTitle>

          <div className="d-flex align-items-center">
            {(!activeKey || activeKey === 'editor') && <CraftPageBuilderController pageId={pageId} />}
            <a href={`https://${host + appPage.path}`} target="_blank" rel="noopener noreferrer">
              <Button>{formatMessage(commonMessages.ui.preview)}</Button>
            </a>
          </div>
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
              <CraftPageBuilderBlock pageAdmin={appPage} onAppPageUpdate={refetchAppPage} />
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
      </CraftPageBuilderProvider>
    </Editor>
  )
}

export default CraftPageAdminPage
