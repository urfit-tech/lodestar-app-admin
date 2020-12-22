import { ArrowLeftOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import ProjectBasicForm from '../../components/project/ProjectBasicForm'
import ProjectIntroForm from '../../components/project/ProjectIntroForm'
import { useApp } from '../../contexts/AppContext'
import { commonMessages, projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectAdminProps, ProjectDataType } from '../../types/project'

const ProjectAdminPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { projectId } = useParams<{ projectId: string }>()
  const [projectKey, setProjectKey] = useQueryParam('tab', StringParam)
  const { settings } = useApp()
  const { loadingProjectAdmin, projectAdmin, refetchProjectAdmin } = useProjectAdmin(projectId)

  return (
    <>
      <AdminHeader>
        <Link
          to={
            projectAdmin?.projectType === 'funding'
              ? '/project-funding'
              : projectAdmin?.projectType === 'pre-order'
              ? '/project-pre-order'
              : ''
          }
        >
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{projectAdmin?.title || projectId}</AdminHeaderTitle>
        <a href={`//${settings['host']}/projects/${projectId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      {loadingProjectAdmin ? (
        <Skeleton active />
      ) : (
        <StyledLayoutContent variant="gray">
          <Tabs
            activeKey={projectKey || 'settings'}
            onChange={key => setProjectKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="settings" tab={formatMessage(projectMessages.label.settings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(projectMessages.label.settings)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                  <ProjectBasicForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(projectMessages.label.projectIntroduction)}</AdminBlockTitle>
                  <ProjectIntroForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="salesPlan" tab={formatMessage(commonMessages.label.salesPlan)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
                {/* <ProjectSalesPlanAdminBlock
                  projectAdmin={projectAdmin}
                  onRefetch={refetchProjectAdmin}
                  onChangeTab={() => setActiveKey('tickets')}
                /> */}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>
                <AdminBlock>
                  {/* <ActivityPublishAdminBlock projectAdmin={projectAdmin} onRefetch={refetchprojectAdmin} /> */}
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      )}
    </>
  )
}

const useProjectAdmin = (projectId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROJECT_ADMIN, types.GET_PROJECT_ADMINVariables>(
    gql`
      query GET_PROJECT_ADMIN($projectId: uuid!) {
        project_by_pk(id: $projectId) {
          id
          title
          abstract
          introduction
          description
          target_amount
          target_unit
          type
          updates
          created_at
          expired_at
          published_at
          comments
          contents
          cover_type
          cover_url
          preview_url
          is_participants_visible
          is_countdown_timer_visible
          creator {
            id
            name
            username
            picture_url
          }
          project_plans {
            id
            project_plan_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
          project_categories {
            category {
              id
              name
            }
          }
        }
      }
    `,
    {
      variables: { projectId },
    },
  )

  const projectAdmin: ProjectAdminProps | null =
    loading || error || !data || !data.project_by_pk
      ? null
      : {
          id: data.project_by_pk.id,
          title: data.project_by_pk.title,
          abstract: data.project_by_pk.abstract,
          introduction: data.project_by_pk.introduction,
          description: data.project_by_pk.description,
          targetAmount: data.project_by_pk.target_amount,
          targetUnit: data.project_by_pk.target_unit,
          projectType: data.project_by_pk.type as ProjectDataType,
          updates: data.project_by_pk.updates,
          createdAt: data.project_by_pk.created_at,
          publishedAt: data.project_by_pk.published_at,
          expiredAt: data.project_by_pk.expired_at,
          comments: data.project_by_pk.comments,
          contents: data.project_by_pk.contents,
          coverType: data.project_by_pk.cover_type,
          coverUrl: data.project_by_pk.cover_url,
          previewUrl: data.project_by_pk.preview_url,
          isParticipantsVisible: data.project_by_pk.is_participants_visible,
          isCountdownTimerVisible: data.project_by_pk.is_countdown_timer_visible,
          categories: data.project_by_pk.project_categories.map(v => ({ id: v.category.id, name: v.category.name })),
        }

  return {
    loadingProjectAdmin: loading,
    errorProjectAdmin: error,
    projectAdmin,
    refetchProjectAdmin: refetch,
  }
}

export default ProjectAdminPage
