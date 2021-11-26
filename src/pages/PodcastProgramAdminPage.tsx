import { Tabs } from 'antd'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPaneTitle, AdminTabBarWrapper, StyledAdminBlock, StyledAdminBlockTitle } from '../components/admin'
import { StyledLayoutContent } from '../components/layout/DefaultLayout'
import PodcastProgramBasicForm from '../components/podcast/PodcastProgramBasicForm'
import PodcastProgramContentForm from '../components/podcast/PodcastProgramContentForm'
import PodcastProgramCreatorBlock from '../components/podcast/PodcastProgramCreatorBlock'
import PodcastProgramHeader from '../components/podcast/PodcastProgramHeader'
import PodcastProgramInstructorCollectionBlock from '../components/podcast/PodcastProgramInstructorCollectionBlock'
import PodcastProgramIntroForm from '../components/podcast/PodcastProgramIntroForm'
import PodcastProgramPlanForm from '../components/podcast/PodcastProgramPlanForm'
import PodcastProgramPublishBlock from '../components/podcast/PodcastProgramPublishBlock'
import { commonMessages, podcastMessages } from '../helpers/translation'
import { usePodcastProgramAdmin } from '../hooks/podcast'

const PodcastProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { podcastProgramId } = useParams<{ podcastProgramId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { podcastProgramAdmin, refetchPodcastProgramAdmin } = usePodcastProgramAdmin(podcastProgramId)

  useEffect(() => {
    refetchPodcastProgramAdmin()
  }, [refetchPodcastProgramAdmin])

  return (
    <>
      <PodcastProgramHeader
        podcastProgramId={podcastProgramId}
        title={podcastProgramAdmin?.title || podcastProgramId}
        goBackLink="/podcast-programs"
      />

      <StyledLayoutContent variant="gray">
        <Tabs
          defaultActiveKey="content"
          activeKey={activeKey || 'content'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="content" tab={formatMessage(podcastMessages.label.podcastContent)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(podcastMessages.label.podcastContent)}</AdminPaneTitle>
              <StyledAdminBlock>
                <PodcastProgramContentForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="settings" tab={formatMessage(podcastMessages.label.podcastSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(podcastMessages.label.podcastSettings)}</AdminPaneTitle>
              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</StyledAdminBlockTitle>
                <PodcastProgramBasicForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </StyledAdminBlock>
              <StyledAdminBlock>
                <StyledAdminBlockTitle>
                  {formatMessage(podcastMessages.label.podcastIntroduction)}
                </StyledAdminBlockTitle>
                <PodcastProgramIntroForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="plan" tab={formatMessage(commonMessages.label.salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
              <StyledAdminBlock>
                <PodcastProgramPlanForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="role" tab={formatMessage(commonMessages.label.roleAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
              <StyledAdminBlock>
                <StyledAdminBlockTitle className="mb-4">
                  {formatMessage(commonMessages.label.owner)}
                </StyledAdminBlockTitle>
                <PodcastProgramCreatorBlock podcastProgramAdmin={podcastProgramAdmin} />
              </StyledAdminBlock>
              <StyledAdminBlock>
                <StyledAdminBlockTitle className="mb-4">
                  {formatMessage(commonMessages.label.instructor)}
                </StyledAdminBlockTitle>
                <PodcastProgramInstructorCollectionBlock
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishAdmin)}>
            <div className="container py-5">
              <StyledAdminBlock>
                <PodcastProgramPublishBlock
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default PodcastProgramAdminPage
