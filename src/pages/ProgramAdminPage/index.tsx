import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneDescription,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useProgram } from '../../hooks/program'
import ProgramApprovalHistoryBlock from './ProgramApprovalHistoryBlock'
import ProgramBasicForm from './ProgramBasicForm'
import ProgramDeletionAdminCard from './ProgramDeletionAdminCard'
import ProgramIntroForm from './ProgramIntroForm'
import ProgramPlanAdminBlock from './ProgramPlanAdminBlock'
import ProgramPublishBlock from './ProgramPublishBlock'
import ProgramRoleAdminPane from './ProgramRoleAdminPane'
import ProgramSharingCodeAdminForm from './ProgramSharingCodeAdminForm'
import ProgramStructureAdminBlock from './ProgramStructureAdminBlock'
import ProgramStructureAdminModal from './ProgramStructureAdminModal'

const ProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { programId } = useParams<{ programId: string }>()
  const { host, enabledModules } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { program, refetchProgram } = useProgram(programId)

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
              <Menu.Item className="py-2 px-3" key={`/programs/${programId}`}>
                {formatMessage(commonMessages.ui.previewIntroduction)}
              </Menu.Item>
              <Menu.Item className="py-2 px-3" key={`/programs/${programId}/contents`}>
                {formatMessage(commonMessages.ui.previewContent)}
              </Menu.Item>
            </Menu>
          }
        >
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
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
          <Tabs.TabPane key="content" tab={formatMessage(programMessages.label.programContent)}>
            <div className="container py-5">
              <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                <span>{formatMessage(programMessages.label.programContent)}</span>
                <ProgramStructureAdminModal program={program} onStructureChange={refetchProgram} />
              </AdminPaneTitle>
              <ProgramStructureAdminBlock program={program} onRefetch={refetchProgram} />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="general" tab={formatMessage(programMessages.label.programSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(programMessages.label.programSettings)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                <ProgramBasicForm program={program} onRefetch={refetchProgram} />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(programMessages.label.programIntroduction)}</AdminBlockTitle>
                <ProgramIntroForm program={program} onRefetch={refetchProgram} />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(programMessages.label.deleteProgram)}</AdminBlockTitle>
                <ProgramDeletionAdminCard program={program} onRefetch={refetchProgram} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="plan" tab={formatMessage(commonMessages.label.salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
              <ProgramPlanAdminBlock program={program} onRefetch={refetchProgram} />
            </div>
          </Tabs.TabPane>

          {enabledModules.sharing_code && (
            <Tabs.TabPane key="sharing" tab={formatMessage(programMessages.label.sharingCode)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(programMessages.label.sharingCode)}</AdminPaneTitle>
                <AdminPaneDescription className="mb-4">
                  {formatMessage(programMessages.text.sharingCodeDescription)}
                </AdminPaneDescription>
                <AdminBlock>
                  <ProgramSharingCodeAdminForm programId={programId} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          )}

          <Tabs.TabPane key="roles" tab={formatMessage(commonMessages.label.roleAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>
              <ProgramRoleAdminPane program={program} onRefetch={refetchProgram} />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>
              <ProgramPublishBlock program={program} onRefetch={refetchProgram} />
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(programMessages.label.approvalHistory)}</AdminBlockTitle>
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
