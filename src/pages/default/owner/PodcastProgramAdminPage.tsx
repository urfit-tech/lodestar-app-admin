import { Tabs } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../../components/admin'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import PodcastProgramBasicForm from '../../../containers/podcast/PodcastProgramBasicForm'
import PodcastProgramContentForm from '../../../containers/podcast/PodcastProgramContentForm'
import PodcastProgramCreatorBlock from '../../../containers/podcast/PodcastProgramCreatorBlock'
import PodcastProgramHeader from '../../../containers/podcast/PodcastProgramHeader'
import PodcastProgramInstructorCollectionBlock from '../../../containers/podcast/PodcastProgramInstructorCollectionBlock'
import PodcastProgramIntroForm from '../../../containers/podcast/PodcastProgramIntroForm'
import PodcastProgramPlanForm from '../../../containers/podcast/PodcastProgramPlanForm'
import PodcastProgramPublishBlock from '../../../containers/podcast/PodcastProgramPublishBlock'
import { PodcastProgramProvider } from '../../../contexts/PodcastProgramContext'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const PodcastProgramAdminPage: React.FC = () => {
  const { match } = useRouter<{ podcastProgramId: string }>()
  const podcastProgramId = match.params.podcastProgramId
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)

  return (
    <PodcastProgramProvider podcastProgramId={podcastProgramId}>
      <StyledWrapper>
        <PodcastProgramHeader podcastProgramId={podcastProgramId} />

        <StyledLayoutContent>
          <Tabs
            defaultActiveKey="content"
            activeKey={activeKey || 'content'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="content" tab="廣播內容">
              <div className="container py-5">
                <AdminPaneTitle>廣播內容</AdminPaneTitle>
                <AdminBlock>
                  <PodcastProgramContentForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="settings" tab="廣播設定">
              <div className="container py-5">
                <AdminPaneTitle>廣播設定</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>基本設定</AdminBlockTitle>
                  <PodcastProgramBasicForm />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>廣播介紹</AdminBlockTitle>
                  <PodcastProgramIntroForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="plan" tab="銷售方案">
              <div className="container py-5">
                <AdminPaneTitle>銷售方案</AdminPaneTitle>
                <AdminBlock>
                  <PodcastProgramPlanForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="role" tab="身份管理">
              <div className="container py-5">
                <AdminPaneTitle>身份管理</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle className="mb-4">建立者</AdminBlockTitle>
                  <PodcastProgramCreatorBlock />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle className="mb-4">講師</AdminBlockTitle>
                  <PodcastProgramInstructorCollectionBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab="發佈">
              <div className="container py-5">
                <AdminBlock>
                  <PodcastProgramPublishBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      </StyledWrapper>
    </PodcastProgramProvider>
  )
}

export default PodcastProgramAdminPage
