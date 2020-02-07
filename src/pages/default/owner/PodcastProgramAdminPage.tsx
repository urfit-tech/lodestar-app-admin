import { Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
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
import { commonMessages, podcastMessages } from '../../../helpers/translation'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const PodcastProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
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
            <Tabs.TabPane key="content" tab={formatMessage(podcastMessages.label.podcastContent)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(podcastMessages.label.podcastContent)}</AdminPaneTitle>
                <AdminBlock>
                  <PodcastProgramContentForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="settings" tab={formatMessage(podcastMessages.label.podcastSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(podcastMessages.label.podcastSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                  <PodcastProgramBasicForm />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(podcastMessages.label.podcastIntroduction)}</AdminBlockTitle>
                  <PodcastProgramIntroForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="plan" tab={formatMessage(commonMessages.label.salesPlan)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
                <AdminBlock>
                  <PodcastProgramPlanForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="role" tab={formatMessage(commonMessages.label.roleAdmin)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.term.owner)}</AdminBlockTitle>
                  <PodcastProgramCreatorBlock />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.term.instructor)}</AdminBlockTitle>
                  <PodcastProgramInstructorCollectionBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishAdmin)}>
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
