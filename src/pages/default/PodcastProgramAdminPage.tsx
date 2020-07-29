import { Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import PodcastProgramBasicForm from '../../containers/podcast/PodcastProgramBasicForm'
import PodcastProgramContentForm from '../../containers/podcast/PodcastProgramContentForm'
import PodcastProgramCreatorBlock from '../../containers/podcast/PodcastProgramCreatorBlock'
import PodcastProgramHeader from '../../containers/podcast/PodcastProgramHeader'
import PodcastProgramInstructorCollectionBlock from '../../containers/podcast/PodcastProgramInstructorCollectionBlock'
import PodcastProgramIntroForm from '../../containers/podcast/PodcastProgramIntroForm'
import PodcastProgramPlanForm from '../../containers/podcast/PodcastProgramPlanForm'
import PodcastProgramPublishBlock from '../../containers/podcast/PodcastProgramPublishBlock'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { usePodcastProgramCollection } from '../../hooks/podcast'

const PodcastProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { podcastProgramId } = useParams<{ podcastProgramId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { podcastProgram, refetchPodcastProgram } = usePodcastProgramCollection(podcastProgramId)

  return (
    <>
      <PodcastProgramHeader
        podcastProgramId={podcastProgramId}
        title={podcastProgram?.title}
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
                <PodcastProgramContentForm podcastProgram={podcastProgram} onRefetch={refetchPodcastProgram} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="settings" tab={formatMessage(podcastMessages.label.podcastSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(podcastMessages.label.podcastSettings)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                <PodcastProgramBasicForm podcastProgram={podcastProgram} onRefetch={refetchPodcastProgram} />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(podcastMessages.label.podcastIntroduction)}</AdminBlockTitle>
                <PodcastProgramIntroForm podcastProgram={podcastProgram} onRefetch={refetchPodcastProgram} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="plan" tab={formatMessage(commonMessages.label.salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
              <AdminBlock>
                <PodcastProgramPlanForm podcastProgram={podcastProgram} onRefetch={refetchPodcastProgram} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="role" tab={formatMessage(commonMessages.label.roleAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.term.owner)}</AdminBlockTitle>
                <PodcastProgramCreatorBlock podcastProgram={podcastProgram} />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle className="mb-4">{formatMessage(commonMessages.term.instructor)}</AdminBlockTitle>
                <PodcastProgramInstructorCollectionBlock
                  podcastProgram={podcastProgram}
                  onRefetch={refetchPodcastProgram}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishAdmin)}>
            <div className="container py-5">
              <AdminBlock>
                <PodcastProgramPublishBlock podcastProgram={podcastProgram} onRefetch={refetchPodcastProgram} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default PodcastProgramAdminPage
