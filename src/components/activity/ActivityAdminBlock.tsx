import { Button, Icon, Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import ActivityPublishAdminBlock from '../../containers/activity/ActivityPublishAdminBlock'
import ActivitySessionsAdminBlock from '../../containers/activity/ActivitySessionsAdminBlock'
import ActivitySettingsAdminBlock from '../../containers/activity/ActivitySettingsAdminBlock'
import ActivityTicketsAdminBlock from '../../containers/activity/ActivityTicketsAdminBlock'
import { StyledLayoutContent } from '../layout/DefaultLayout'
import { ActivitySessionProps } from './ActivitySessionsAdminBlock'
import { ActivityTicketProps } from './ActivityTicket'

const StyledHeader = styled.header`
  padding: 0 0.5rem;
  height: 64px;
  background: white;

  a:first-child {
    margin-left: 0.75rem;
  }

  .anticon {
    color: var(--gray-darker);
    font-size: 20px;
  }
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledTabBarWrapper = styled.div`
  background: white;

  .ant-tabs-nav-scroll {
    text-align: center;
  }
`

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
  const [defaultActivekey, setDefaultActivekey] = useQueryParam('tabkey', StringParam)
  const [activeKey, setActiveKey] = useState(defaultActivekey || 'settings')

  return (
    <>
      <StyledHeader className="d-flex align-items-center justify-content-between">
        <Link to="/studio/activities/" className="mr-3">
          <Icon type="arrow-left" />
        </Link>
        <StyledTitle className="flex-grow-1">{activityAdmin.title}</StyledTitle>
        <a href={`/activities/${activityAdmin.id}`} target="_blank" rel="noopener noreferrer">
          <Button>預覽</Button>
        </a>
      </StyledHeader>

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
              <StyledTabBarWrapper>
                <DefaultTabBar {...props} />
              </StyledTabBarWrapper>
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
