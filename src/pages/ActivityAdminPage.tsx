import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import ActivityBasicForm from '../components/activity/ActivityBasicForm'
import ActivityIntroductionForm from '../components/activity/ActivityIntroductionForm'
import ActivityOrganizerCollectionBlock from '../components/activity/ActivityOrganizerCollectionBlock'
import ActivityPublishAdminBlock from '../components/activity/ActivityPublishAdminBlock'
import ActivitySessionsAdminBlock from '../components/activity/ActivitySessionsAdminBlock'
import ActivityTicketsAdminBlock from '../components/activity/ActivityTicketsAdminBlock'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../components/admin'
import MetaProductDeletionBlock from '../components/common/MetaProductDeletionBlock'
import { StyledLayoutContent } from '../components/layout/DefaultLayout'
import { activityMessages, commonMessages } from '../helpers/translation'
import { useActivityAdmin } from '../hooks/activity'

const messages = defineMessages({
  settings: { id: 'activity.label.settings', defaultMessage: '相關設定' },
  activityIntroduction: { id: 'activity.label.activityIntroduction', defaultMessage: '活動介紹' },
  sessionAdmin: { id: 'activity.label.sessionAdmin', defaultMessage: '場次管理' },
  publishSettings: { id: 'activity.label.publishSettings', defaultMessage: '發佈設定' },
  roleAdmin: { id: 'activity.label.roleAdmin', defaultMessage: '身份管理' },
})

const ActivityAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { activityId } = useParams<{ activityId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { host } = useApp()
  const { loadingActivityAdmin, activityAdmin, refetchActivityAdmin } = useActivityAdmin(activityId)

  return (
    <>
      <AdminHeader>
        <Link to="/activities">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{activityAdmin?.title || activityId}</AdminHeaderTitle>
        <a href={`//${host}/activities/${activityId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      {loadingActivityAdmin ? (
        <Skeleton active />
      ) : (
        <StyledLayoutContent variant="gray">
          <Tabs
            activeKey={activeKey || 'settings'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="settings" tab={formatMessage(messages.settings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.settings)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                  <ActivityBasicForm activityAdmin={activityAdmin} onRefetch={refetchActivityAdmin} />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(messages.activityIntroduction)}</AdminBlockTitle>
                  <ActivityIntroductionForm activityAdmin={activityAdmin} onRefetch={refetchActivityAdmin} />
                </AdminBlock>
                <MetaProductDeletionBlock metaProductType="Activity" targetId={activityId} />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="sessions" tab={formatMessage(messages.sessionAdmin)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.sessionAdmin)}</AdminPaneTitle>
                <ActivitySessionsAdminBlock
                  activityAdmin={activityAdmin}
                  onRefetch={refetchActivityAdmin}
                  onChangeTab={() => setActiveKey('tickets')}
                />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="tickets" tab={formatMessage(activityMessages.label.ticketPlan)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(activityMessages.label.ticketPlan)}</AdminPaneTitle>
                <ActivityTicketsAdminBlock activityAdmin={activityAdmin} onRefetch={refetchActivityAdmin} />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="roles" tab={formatMessage(messages.roleAdmin)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.label.organizer)}</AdminBlockTitle>
                  <ActivityOrganizerCollectionBlock activity={activityAdmin} onRefetch={refetchActivityAdmin} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab={formatMessage(messages.publishSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.publishSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <ActivityPublishAdminBlock activityAdmin={activityAdmin} onRefetch={refetchActivityAdmin} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      )}
    </>
  )
}

export default ActivityAdminPage
