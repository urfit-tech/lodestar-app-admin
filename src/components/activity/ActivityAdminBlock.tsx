import { Button, Icon, Skeleton, Tabs } from 'antd'
import React, { useContext, useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import ActivityPublishAdminBlock from '../../containers/activity/ActivityPublishAdminBlock'
import ActivitySessionsAdminBlock from '../../containers/activity/ActivitySessionsAdminBlock'
import ActivitySettingsAdminBlock from '../../containers/activity/ActivitySettingsAdminBlock'
import ActivityTicketsAdminBlock from '../../containers/activity/ActivityTicketsAdminBlock'
import AppContext from '../../containers/common/AppContext'
import { AdminHeader, AdminHeaderTitle, AdminTabBarWrapper } from '../admin'
import { StyledLayoutContent } from '../layout/DefaultLayout'
import { ActivitySessionProps } from './ActivitySessionsAdminBlock'
import { ActivityTicketProps } from './ActivityTicket'

export type ActivityAdminProps = {
  id: string
  title: string
  description: string
  coverUrl: string | null
  isParticipantsVisible: boolean
  organizerId: string
  publishedAt: Date | null

  activityCategories: {
    id: string
    category: {
      id: string
      name: string
    }
    position: number
  }[]
  activitySessions: ActivitySessionProps[]
  activityTickets: ActivityTicketProps[]
}

const ActivityAdminBlock: React.FC<{
  loading?: boolean
  error?: Error
  activityAdmin: ActivityAdminProps
  onRefetch?: () => void
}> = ({ loading, error, activityAdmin, onRefetch }) => {
  const { history } = useRouter()
  const [defaultActivekey, setDefaultActivekey] = useQueryParam('tabkey', StringParam)
  const [activeKey, setActiveKey] = useState(defaultActivekey || 'settings')
  const app = useContext(AppContext)

  return (
    <>
      <AdminHeader className="d-flex align-items-center justify-content-between">
        <div className="mr-3 cursor-pointer" onClick={() => history.goBack()}>
          <Icon type="arrow-left" />
        </div>
        <AdminHeaderTitle className="flex-grow-1">{activityAdmin.title}</AdminHeaderTitle>
        <a href={`https://${app.domain}/activities/${activityAdmin.id}`} target="_blank" rel="noopener noreferrer">
          <Button>預覽</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent>
        {loading ? (
          <Skeleton active />
        ) : error ? (
          '讀取失敗'
        ) : (
          <Tabs
            activeKey={activeKey}
            onChange={key => {
              setActiveKey(key)
              setDefaultActivekey(key)
            }}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="settings" tab="相關設定">
              <ActivitySettingsAdminBlock activityAdmin={activityAdmin} onRefetch={onRefetch} />
            </Tabs.TabPane>
            <Tabs.TabPane key="sessions" tab="場次管理">
              <ActivitySessionsAdminBlock
                activityAdmin={activityAdmin}
                onRefetch={onRefetch}
                onChangeTab={() => setActiveKey('tickets')}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="tickets" tab="票券方案">
              <ActivityTicketsAdminBlock activityAdmin={activityAdmin} onRefetch={onRefetch} />
            </Tabs.TabPane>
            <Tabs.TabPane key="publish" tab="發佈">
              <ActivityPublishAdminBlock
                activityAdmin={activityAdmin}
                onChangeTab={(key: string) => setActiveKey(key)}
                onRefetch={onRefetch}
              />
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
    </>
  )
}

export default ActivityAdminBlock
