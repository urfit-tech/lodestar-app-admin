import { Button, Icon, Skeleton, Tabs } from 'antd'
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { StyledLayoutContent } from '../layout/DefaultLayout'
import PodcastProgramContentAdminBlock from './PodcastProgramContentAdminBlock'
import PodcastProgramPlanAdminBlock from './PodcastProgramPlanAdminBlock'
import PodcastProgramPublishAdminBlock from './PodcastProgramPublishAdminBlock'
import PodcastProgramRoleAdminBlock from './PodcastProgramRoleAdminBlock'
import PodcastProgramSettingsAdminBlock from './PodcastProgramSettingsAdminBlock'

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
export const StyledAdminPaneTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const StyledAdminBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 2.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
export const StyledAdminBlockTitle = styled.h2`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`

const PodcastProgramAdminBlock: React.FC<{
  loading?: boolean
  error?: Error
}> = ({ loading, error }) => {
  const [defaultActiveKey, setDefaultActiveKey] = useQueryParam('tabkey', StringParam)
  const { podcastProgramAdmin } = useContext(PodcastProgramAdminContext)
  const [activeKey, setActiveKey] = useState(defaultActiveKey || 'content')

  return (
    <>
      <StyledHeader className="d-flex align-items-center justify-content-between">
        <Link to="/admin/podcasts/" className="mr-3">
          <Icon type="arrow-left" />
        </Link>
        <StyledTitle className="flex-grow-1">{podcastProgramAdmin.title}</StyledTitle>
        <a href={`/podcasts/${podcastProgramAdmin.id}`} target="_blank" rel="noopener noreferrer">
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
              setDefaultActiveKey(key)
            }}
            renderTabBar={(props, DefaultTabBar) => (
              <StyledTabBarWrapper>
                <DefaultTabBar {...props} />
              </StyledTabBarWrapper>
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
