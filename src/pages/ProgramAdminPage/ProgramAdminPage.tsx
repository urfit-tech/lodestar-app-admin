import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockSubTitle,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneDescription,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import MetaProductDeletionBlock from '../../components/common/MetaProductDeletionBlock'
import OpenGraphSettingsBlock from '../../components/form/OpenGraphSettingsBlock'
import SeoSettingsBlock from '../../components/form/SeoSettingsBlock'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { useMutateProgram, useProgram } from '../../hooks/program'
import pageMessages from '../translation'
import ProgramApprovalHistoryBlock from './ProgramApprovalHistoryBlock'
import ProgramBasicForm from './ProgramBasicForm'
import ProgramCoverForm from './ProgramCoverForm'
import ProgramIntroForm from './ProgramIntroForm'
import ProgramPlanAdminBlock from './ProgramPlanAdminBlock'
import ProgramPublishBlock from './ProgramPublishBlock'
import ProgramRoleAdminPane from './ProgramRoleAdminPane'
import ProgramSharingCodeAdminForm from './ProgramSharingCodeAdminForm'
import ProgramStructureAdminBlock from './ProgramStructureAdminBlock'
import ProgramStructureAdminModal from './ProgramStructureAdminModal'
import ProgramAdminPageMessages from './translation'

const ProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { programId } = useParams<{ programId: string }>()
  const { host, enabledModules } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { program, refetchProgram } = useProgram(programId)
  const { updateProgramMetaTag } = useMutateProgram()

  return (
    <>
      <AdminHeader>
        <Link to="/programs">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{program?.title || programId}</AdminHeaderTitle>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          overlay={
            <Menu onClick={({ key }) => window.open(`//${host}${key}`, '_blank')}>
              <Menu.Item className="py-2 px-3" key={`/programs/${programId}?visitIntro=1`}>
                {formatMessage(ProgramAdminPageMessages['*'].previewIntroduction)}
              </Menu.Item>
              <Menu.Item className="py-2 px-3" key={`/programs/${programId}/contents`}>
                {formatMessage(ProgramAdminPageMessages['*'].previewContent)}
              </Menu.Item>
            </Menu>
          }
        >
          <Button>{formatMessage(ProgramAdminPageMessages['*'].preview)}</Button>
        </Dropdown>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'content'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="content" tab={formatMessage(ProgramAdminPageMessages['*'].programContent)}>
            <div className="container py-5">
              <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                <span>{formatMessage(ProgramAdminPageMessages['*'].programContent)}</span>
                <ProgramStructureAdminModal program={program} onStructureChange={refetchProgram} />
              </AdminPaneTitle>
              <ProgramStructureAdminBlock program={program} onRefetch={refetchProgram} />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="general" tab={formatMessage(ProgramAdminPageMessages['*'].programSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(ProgramAdminPageMessages['*'].programSettings)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(ProgramAdminPageMessages['*'].basicSettings)}</AdminBlockTitle>
                <ProgramBasicForm program={program} onRefetch={refetchProgram} />
              </AdminBlock>

              <AdminBlock>
                {program?.id ? (
                  <>
                    <AdminBlockTitle className="mb-2">
                      {formatMessage(ProgramAdminPageMessages['*'].programCover)}
                    </AdminBlockTitle>
                    <AdminBlockSubTitle className="mb-4">
                      {formatMessage(ProgramAdminPageMessages['*'].programCoverDescription)}
                    </AdminBlockSubTitle>
                    <ProgramCoverForm
                      programId={program.id}
                      coverDefaultUrl={program?.coverUrl || ''}
                      coverMobileUrl={program?.coverMobileUrl || ''}
                      coverThumbnailUrl={program?.coverThumbnailUrl || ''}
                      onRefetch={refetchProgram}
                    />
                  </>
                ) : null}
              </AdminBlock>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(ProgramAdminPageMessages['*'].programIntroduction)}</AdminBlockTitle>
                <ProgramIntroForm program={program} onRefetch={refetchProgram} />
              </AdminBlock>

              <SeoSettingsBlock
                id={program?.id}
                metaTag={program?.metaTag}
                updateMetaTag={updateProgramMetaTag}
                onRefetch={refetchProgram}
              />

              <OpenGraphSettingsBlock
                id={program?.id}
                type="program"
                metaTag={program?.metaTag}
                updateMetaTag={updateProgramMetaTag}
                onRefetch={refetchProgram}
              />

              <MetaProductDeletionBlock
                metaProductType="Program"
                targetId={programId}
                renderDeleteDangerText={formatMessage(pageMessages['*'].deleteProductDanger)}
              />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="plan" tab={formatMessage(ProgramAdminPageMessages['*'].salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(ProgramAdminPageMessages['*'].salesPlan)}</AdminPaneTitle>
              <ProgramPlanAdminBlock program={program} onRefetch={refetchProgram} />
            </div>
          </Tabs.TabPane>

          {enabledModules.sharing_code && (
            <Tabs.TabPane key="sharing" tab={formatMessage(ProgramAdminPageMessages['*'].sharingCode)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(ProgramAdminPageMessages['*'].sharingCode)}</AdminPaneTitle>
                <AdminPaneDescription className="mb-4">
                  {formatMessage(ProgramAdminPageMessages['*'].sharingCodeDescription)}
                </AdminPaneDescription>
                <AdminBlock>
                  <ProgramSharingCodeAdminForm programId={programId} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          )}

          <Tabs.TabPane key="roles" tab={formatMessage(ProgramAdminPageMessages['*'].roleAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(ProgramAdminPageMessages['*'].roleAdmin)}</AdminPaneTitle>
              <ProgramRoleAdminPane program={program} onRefetch={refetchProgram} />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="publish" tab={formatMessage(ProgramAdminPageMessages['*'].publishSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(ProgramAdminPageMessages['*'].publishSettings)}</AdminPaneTitle>
              <ProgramPublishBlock program={program} onRefetch={refetchProgram} />
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(ProgramAdminPageMessages['*'].approvalHistory)}</AdminBlockTitle>
                <ProgramApprovalHistoryBlock program={program} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default ProgramAdminPage
