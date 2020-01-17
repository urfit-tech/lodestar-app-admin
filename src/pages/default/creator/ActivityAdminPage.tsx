import { Tabs } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../../components/admin'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import ActivityBasicForm from '../../../containers/activity/ActivityBasicForm'
import ActivityHeader from '../../../containers/activity/ActivityHeader'
import ActivityIntroductionForm from '../../../containers/activity/ActivityIntroductionForm'
import ActivityPublishAdminBlock from '../../../containers/activity/ActivityPublishAdminBlock'
import ActivitySessionsAdminBlock from '../../../containers/activity/ActivitySessionsAdminBlock'
import ActivityTicketsAdminBlock from '../../../containers/activity/ActivityTicketsAdminBlock'
import { ActivityProvider } from '../../../contexts/ActivityContext'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`
const ActivityAdminPage = () => {
  const { match } = useRouter<{ activityId: string }>()
  const activityId = match.params.activityId
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)

  return (
    <ActivityProvider activityId={activityId}>
      <StyledWrapper>
        <ActivityHeader activityId={activityId} />

        <StyledLayoutContent>
          <Tabs
            defaultActiveKey="settings"
            activeKey={activeKey || 'settings'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="settings" tab="相關設定">
              <div className="container py-5">
                <AdminPaneTitle>相關設定</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>基本設定</AdminBlockTitle>
                  <ActivityBasicForm />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>活動介紹</AdminBlockTitle>
                  <ActivityIntroductionForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="sessions" tab="場次管理">
              <div className="container py-5">
                <AdminPaneTitle>場次管理</AdminPaneTitle>
                <ActivitySessionsAdminBlock onChangeTab={() => setActiveKey('tickets')} />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="tickets" tab="票券方案">
              <div className="container py-5">
                <AdminPaneTitle>票券方案</AdminPaneTitle>
                <ActivityTicketsAdminBlock />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab="發佈">
              <ActivityPublishAdminBlock />
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      </StyledWrapper>
    </ActivityProvider>
  )
}

export default ActivityAdminPage
