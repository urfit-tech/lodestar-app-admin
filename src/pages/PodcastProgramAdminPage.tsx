import { Skeleton, Tabs } from 'antd'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../components/admin'
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
  const { podcastProgramAdmin, refetchPodcastProgramAdmin, loadingPodcastProgramAdmin } =
    usePodcastProgramAdmin(podcastProgramId)

  useEffect(() => {
    refetchPodcastProgramAdmin()
  }, [refetchPodcastProgramAdmin])

  if (loadingPodcastProgramAdmin) {
    return <Skeleton active />
  }

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
              <AdminBlock>
                <PodcastProgramContentForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="settings" tab={formatMessage(podcastMessages.label.podcastSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(podcastMessages.label.podcastSettings)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                <PodcastProgramBasicForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(podcastMessages.label.podcastIntroduction)}</AdminBlockTitle>
                <PodcastProgramIntroForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="plan" tab={formatMessage(commonMessages.label.salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
              <AdminBlock>
                <PodcastProgramPlanForm
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="role" tab={formatMessage(commonMessages.label.roleAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.label.owner)}</AdminBlockTitle>
                <PodcastProgramCreatorBlock podcastProgramAdmin={podcastProgramAdmin} />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.label.instructor)}</AdminBlockTitle>
                <PodcastProgramInstructorCollectionBlock
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishAdmin)}>
            <div className="container py-5">
              <AdminBlock>
                <PodcastProgramPublishBlock
                  podcastProgramAdmin={podcastProgramAdmin}
                  onRefetch={refetchPodcastProgramAdmin}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default PodcastProgramAdminPage
