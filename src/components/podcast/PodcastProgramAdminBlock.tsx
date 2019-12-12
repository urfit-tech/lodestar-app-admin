import { Button, Icon, Skeleton, Tabs } from 'antd'
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { AdminHeader, AdminHeaderTitle, AdminTabBarWrapper } from '../admin'
import { StyledLayoutContent } from '../layout/DefaultLayout'
import PodcastProgramContentAdminBlock from './PodcastProgramContentAdminBlock'
import PodcastProgramPlanAdminBlock from './PodcastProgramPlanAdminBlock'
import PodcastProgramPublishAdminBlock from './PodcastProgramPublishAdminBlock'
import PodcastProgramRoleAdminBlock from './PodcastProgramRoleAdminBlock'
import PodcastProgramSettingsAdminBlock from './PodcastProgramSettingsAdminBlock'

const PodcastProgramAdminBlock: React.FC<{
  loading?: boolean
  error?: Error
}> = ({ loading, error }) => {
  const [defaultActiveKey, setDefaultActiveKey] = useQueryParam('tabkey', StringParam)
  const { podcastProgramAdmin } = useContext(PodcastProgramAdminContext)
  const [activeKey, setActiveKey] = useState(defaultActiveKey || 'content')

  return (
    <>
      <AdminHeader className="d-flex align-items-center justify-content-between">
        <Link to="/admin/podcast-programs/" className="mr-3">
          <Icon type="arrow-left" />
        </Link>
        <AdminHeaderTitle className="flex-grow-1">{podcastProgramAdmin.title}</AdminHeaderTitle>
        <a href={`/podcast-programs/${podcastProgramAdmin.id}`} target="_blank" rel="noopener noreferrer">
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
              setDefaultActiveKey(key)
            }}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="content" tab="廣播內容">
              <PodcastProgramContentAdminBlock />
            </Tabs.TabPane>
            <Tabs.TabPane key="settings" tab="廣播設定">
              <PodcastProgramSettingsAdminBlock />
            </Tabs.TabPane>
            <Tabs.TabPane key="plan" tab="銷售方案">
              <PodcastProgramPlanAdminBlock />
            </Tabs.TabPane>
            <Tabs.TabPane key="role" tab="身份管理">
              <PodcastProgramRoleAdminBlock />
            </Tabs.TabPane>
            <Tabs.TabPane key="publish" tab="發佈">
              <PodcastProgramPublishAdminBlock
                onChangeTab={key => {
                  setActiveKey(key)
                  setDefaultActiveKey(key)
                }}
              />
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
    </>
  )
}

export default PodcastProgramAdminBlock
