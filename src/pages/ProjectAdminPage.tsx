import { ArrowLeftOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockDescription,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../components/admin'
import RoleAdminBlock from '../components/admin/RoleAdminBlock'
import SharingCodeTab from '../components/common/SharingCode/SharingCodeTab'
import commonComponentMessages from '../components/common/translation'
import OpenGraphSettingsBlock from '../components/form/OpenGraphSettingsBlock'
import SeoSettingsBlock from '../components/form/SeoSettingsBlock'
import { StyledLayoutContent } from '../components/layout/DefaultLayout'
import ProjectBasicForm from '../components/project/ProjectBasicForm'
import ProjectIntroForm from '../components/project/ProjectIntroForm'
import ProjectParticipantBlock from '../components/project/ProjectParticipantBlock'
import ProjectPlanAdminBlock from '../components/project/ProjectPlanAdminBlock'
import ProjectPortfolioAuthorBlock from '../components/project/ProjectPortfolioAuthorBlock'
import ProjectPortfolioBasicForm from '../components/project/ProjectPortfolioBasicForm'
import ProjectPortfolioDescriptionForm from '../components/project/ProjectPortfolioDescriptionForm'
import ProjectPortfolioSettingsForm from '../components/project/ProjectPortfolioSettingsForm'
import ProjectPublishAdminBlock from '../components/project/ProjectPublishAdminBlock'
import hasura from '../hasura'
import { commonMessages } from '../helpers/translation'
import { ProjectAdminProps, ProjectDataType } from '../types/project'
import pageMessages from './translation'

const ProjectPortfolioBlockTitle = styled(AdminBlockTitle)`
  margin-bottom: 8px;
`

const ProjectAdminPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { projectId } = useParams<{ projectId: string }>()
  const [projectKey, setProjectKey] = useQueryParam('tab', StringParam)
  const { host, enabledModules } = useApp()
  const { loadingProjectAdmin, projectAdmin, refetchProjectAdmin } = useProjectAdmin(projectId)
  const { updateProjectMetaTag } = useMutateProjectAdmin()
  return (
    <>
      <AdminHeader>
        <Link
          to={
            projectAdmin?.projectType === 'funding'
              ? `/project-funding`
              : projectAdmin?.projectType === 'pre-order'
              ? `/project-pre-order`
              : projectAdmin?.projectType === 'portfolio'
              ? `/project-portfolio`
              : ''
          }
        >
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{projectAdmin?.title || projectId}</AdminHeaderTitle>
        <a href={`//${host}/projects/${projectId}`} target="_blank" rel="noopener noreferrer">
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
            {projectAdmin?.projectType === 'portfolio' ? (
              <>
                <Tabs.TabPane key="settings" tab={formatMessage(pageMessages.ProjectAdminPage.portfolioContent)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(pageMessages.ProjectAdminPage.portfolioContent)}</AdminPaneTitle>
                    <AdminBlock>
                      <AdminBlockTitle>
                        {formatMessage(pageMessages.ProjectAdminPage.portfolioSettings)}
                      </AdminBlockTitle>
                      <ProjectPortfolioSettingsForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                    </AdminBlock>
                    <AdminBlock>
                      <ProjectPortfolioBlockTitle>
                        {formatMessage(pageMessages.ProjectAdminPage.portfolioDescription)}
                      </ProjectPortfolioBlockTitle>
                      <AdminBlockDescription>
                        {formatMessage(pageMessages.ProjectAdminPage.portfolioDescriptionNotice)}
                      </AdminBlockDescription>
                      <ProjectPortfolioDescriptionForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                    </AdminBlock>
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane key="management" tab={formatMessage(pageMessages.ProjectAdminPage.portfolioManagement)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(pageMessages.ProjectAdminPage.portfolioManagement)}</AdminPaneTitle>
                    <AdminBlock>
                      <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                      <ProjectPortfolioBasicForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                    </AdminBlock>
                    <SeoSettingsBlock
                      id={projectAdmin?.id}
                      metaTag={projectAdmin?.metaTag}
                      updateMetaTag={updateProjectMetaTag}
                      onRefetch={refetchProjectAdmin}
                    />
                    <OpenGraphSettingsBlock
                      id={projectAdmin?.id}
                      type="project"
                      metaTag={projectAdmin?.metaTag}
                      updateMetaTag={updateProjectMetaTag}
                      onRefetch={refetchProjectAdmin}
                    />
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane key="role" tab={formatMessage(commonMessages.label.roleAdmin)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
                    <AdminBlock>
                      <AdminBlockTitle>{formatMessage(commonMessages.label.owner)}</AdminBlockTitle>
                      <RoleAdminBlock
                        name={projectAdmin.creator?.name || ''}
                        pictureUrl={projectAdmin.creator?.pictureUrl || ''}
                      />
                    </AdminBlock>
                    <AdminBlock>
                      <ProjectPortfolioBlockTitle>
                        {formatMessage(commonMessages.label.author)}
                      </ProjectPortfolioBlockTitle>
                      <AdminBlockDescription>
                        {formatMessage(pageMessages.ProjectAdminPage.portfolioAuthorNotice)}
                      </AdminBlockDescription>
                      <ProjectPortfolioAuthorBlock
                        projectId={projectAdmin.id}
                        publishedAt={projectAdmin.publishedAt}
                        onRefetch={refetchProjectAdmin}
                      />
                    </AdminBlock>
                    <AdminBlock>
                      <AdminBlockTitle>{formatMessage(commonMessages.label.participant)}</AdminBlockTitle>
                      <ProjectParticipantBlock projectId={projectAdmin.id} publishAt={projectAdmin.publishedAt} />
                    </AdminBlock>
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.portfolioPublishSettings)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(commonMessages.label.portfolioPublishSettings)}</AdminPaneTitle>
                    <AdminBlock>
                      <ProjectPublishAdminBlock
                        type="portfolio"
                        project={projectAdmin}
                        onRefetch={refetchProjectAdmin}
                      />
                    </AdminBlock>
                  </div>
                </Tabs.TabPane>
              </>
            ) : (
              <>
                <Tabs.TabPane key="settings" tab={formatMessage(pageMessages.ProjectAdminPage.settings)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(pageMessages.ProjectAdminPage.settings)}</AdminPaneTitle>
                    <AdminBlock>
                      <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                      <ProjectBasicForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                    </AdminBlock>
                    <AdminBlock>
                      <AdminBlockTitle>
                        {formatMessage(pageMessages.ProjectAdminPage.projectIntroduction)}
                      </AdminBlockTitle>
                      <ProjectIntroForm project={projectAdmin} onRefetch={refetchProjectAdmin} />
                    </AdminBlock>
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane key="salesPlan" tab={formatMessage(commonMessages.label.salesPlan)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
                    <ProjectPlanAdminBlock
                      projectId={projectId}
                      project={projectAdmin}
                      onRefetch={refetchProjectAdmin}
                    />
                  </div>
                </Tabs.TabPane>
                {enabledModules.sharing_code && (
                  <Tabs.TabPane key="sharing" tab={formatMessage(commonComponentMessages.SharingCode.title)}>
                    <SharingCodeTab typePath="projects" target={projectId} />
                  </Tabs.TabPane>
                )}
                <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishSettings)}>
                  <div className="container py-5">
                    <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>
                    <AdminBlock>
                      <ProjectPublishAdminBlock type="funding" project={projectAdmin} onRefetch={refetchProjectAdmin} />
                    </AdminBlock>
                  </div>
                </Tabs.TabPane>
              </>
            )}
          </Tabs>
        </StyledLayoutContent>
      )}
    </>
  )
}

const useProjectAdmin = (projectId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PROJECT_ADMIN, hasura.GET_PROJECT_ADMINVariables>(
    gql`
      query GET_PROJECT_ADMIN($projectId: uuid!) {
        project_by_pk(id: $projectId) {
          id
          title
          abstract
          introduction
          introduction_desktop
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
          meta_tag
          creator {
            id
            name
            username
            picture_url
          }
          project_plans(order_by: { position: asc }) {
            id
            project_id
            cover_url
            title
            description
            currency_id
            list_price
            sale_price
            sold_at
            discount_down_price
            is_subscription
            period_amount
            period_type
            position
            is_participants_visible
            is_physical
            is_limited
            published_at
            auto_renewed
            project_plan_products {
              product_id
              options
            }
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
          project_tags(order_by: { position: asc }) {
            id
            tag_name
            tag {
              name
            }
          }
          project_roles(where: { identity: { name: { _eq: "author" } } }) {
            member_id
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
          title: data.project_by_pk.title || '',
          abstract: data.project_by_pk.abstract || '',
          introduction: data.project_by_pk.introduction || '',
          introductionDesktop: data.project_by_pk.introduction_desktop || '',
          description: data.project_by_pk.description || '',
          targetAmount: data.project_by_pk.target_amount,
          targetUnit: data.project_by_pk.target_unit,
          projectType: data.project_by_pk.type as ProjectDataType,
          updates: data.project_by_pk.updates,
          createdAt: data.project_by_pk.created_at && new Date(data.project_by_pk.created_at),
          publishedAt: data.project_by_pk.published_at && new Date(data.project_by_pk.published_at),
          expiredAt: data.project_by_pk.expired_at && new Date(data.project_by_pk.expired_at),
          comments: data.project_by_pk.comments,
          contents: data.project_by_pk.contents,
          coverType: data.project_by_pk.cover_type,
          coverUrl: data.project_by_pk.cover_url || null,
          previewUrl: data.project_by_pk.preview_url || null,
          metaTag: data.project_by_pk.meta_tag || null,
          isParticipantsVisible: data.project_by_pk.is_participants_visible,
          isCountdownTimerVisible: data.project_by_pk.is_countdown_timer_visible,
          projectPlan: data.project_by_pk.project_plans.map(v => ({
            id: v.id,
            projectId: v.project_id,
            coverUrl: v.cover_url || null,
            title: v.title || '',
            description: v.description || '',
            currencyId: v.currency_id,
            listPrice: v.list_price,
            salePrice: v.sale_price,
            soldAt: v.sold_at && new Date(v.sold_at),
            discountDownPrice: v.discount_down_price,
            isSubscription: v.is_subscription,
            periodAmount: v.period_amount,
            periodType: v.period_type || null,
            position: v.position || 0,
            isParticipantsVisible: v.is_participants_visible,
            isPhysical: v.is_physical,
            isLimited: v.is_limited,
            publishedAt: v.published_at && new Date(v.published_at),
            autoRenewed: v.auto_renewed,
            projectPlanEnrollment: v.project_plan_enrollments_aggregate.aggregate?.count || 0,
            products: v.project_plan_products.map(u => ({ id: u.product_id, options: u.options })),
          })),
          categories: data.project_by_pk.project_categories.map(v => ({ id: v.category.id, name: v.category.name })),
          tags: data.project_by_pk.project_tags.map(projectTag => projectTag.tag?.name || projectTag.tag_name),
          creator: {
            id: data.project_by_pk.creator?.id || '',
            name: data.project_by_pk.creator?.name || '',
            pictureUrl: data.project_by_pk.creator?.picture_url || '',
          },
          authorId: data.project_by_pk.project_roles[0]?.member_id || null,
        }

  return {
    loadingProjectAdmin: loading,
    errorProjectAdmin: error,
    projectAdmin,
    refetchProjectAdmin: refetch,
  }
}

const useMutateProjectAdmin = () => {
  const [updateProjectMetaTag] = useMutation<hasura.UPDATE_PROJECT_META_TAG, hasura.UPDATE_PROJECT_META_TAGVariables>(
    gql`
      mutation UPDATE_PROJECT_META_TAG($id: uuid!, $metaTag: jsonb) {
        update_project(where: { id: { _eq: $id } }, _set: { meta_tag: $metaTag }) {
          affected_rows
        }
      }
    `,
  )

  return {
    updateProjectMetaTag,
  }
}

export default ProjectAdminPage
