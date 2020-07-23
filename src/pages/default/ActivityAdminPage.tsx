import { Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import ActivityBasicForm from '../../containers/activity/ActivityBasicForm'
import ActivityHeader from '../../containers/activity/ActivityHeader'
import ActivityIntroductionForm from '../../containers/activity/ActivityIntroductionForm'
import ActivityPublishAdminBlock from '../../containers/activity/ActivityPublishAdminBlock'
import ActivitySessionsAdminBlock from '../../containers/activity/ActivitySessionsAdminBlock'
import ActivityTicketsAdminBlock from '../../containers/activity/ActivityTicketsAdminBlock'
import { ActivityProvider } from '../../contexts/ActivityContext'
import { activityMessages, commonMessages } from '../../helpers/translation'

const messages = defineMessages({
  settings: { id: 'activity.label.settings', defaultMessage: '相關設定' },
  activityIntroduction: { id: 'activity.label.activityIntroduction', defaultMessage: '活動介紹' },
  sessionAdmin: { id: 'activity.label.sessionAdmin', defaultMessage: '場次管理' },
  publishSettings: { id: 'activity.label.publishSettings', defaultMessage: '發佈設定' },
})

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const ActivityAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { activityId } = useParams<{ activityId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

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
            <Tabs.TabPane key="settings" tab={formatMessage(messages.settings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.settings)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                  <ActivityBasicForm />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(messages.activityIntroduction)}</AdminBlockTitle>
                  <ActivityIntroductionForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="sessions" tab={formatMessage(messages.sessionAdmin)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.sessionAdmin)}</AdminPaneTitle>
                <ActivitySessionsAdminBlock onChangeTab={() => setActiveKey('tickets')} />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="tickets" tab={formatMessage(activityMessages.term.ticketPlan)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(activityMessages.term.ticketPlan)}</AdminPaneTitle>
                <ActivityTicketsAdminBlock />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab={formatMessage(messages.publishSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.publishSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <ActivityPublishAdminBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      </StyledWrapper>
    </ActivityProvider>
  )
}

export default ActivityAdminPage
