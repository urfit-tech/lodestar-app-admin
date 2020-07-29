import { Button, Dropdown, Menu, PageHeader, Tabs } from 'antd'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminTabBarWrapper } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import ProgramContentAdminPane from '../../components/program/ProgramContentAdminPane'
import ProgramPlanAdminPane from '../../components/program/ProgramPlanAdminPane'
import ProgramPublishingAdminPane from '../../components/program/ProgramPublishingAdminPane'
import ProgramSettingAdminPane from '../../components/program/ProgramSettingAdminPane'
import ProgramRoleAdminPane from '../../containers/program/ProgramRoleAdminPane'
import AppContext from '../../contexts/AppContext'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useProgram } from '../../hooks/program'

const StyledPageHeader = styled(PageHeader)`
  && {
    padding: 10px 24px;
    height: 64px;
  }

  .ant-page-header-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ant-page-header-heading-title {
    flex-grow: 1;
    font-size: 16px;
  }

  .ant-page-header-heading-extra {
    width: auto;
    padding: 0;
  }
`

const ProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { programId } = useParams<{ programId: string }>()
  const { settings } = useContext(AppContext)
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { program, refetch: refetchProgram } = useProgram(programId)

  return (
    <>
      <StyledPageHeader
        onBack={() => history.push('/programs')}
        title={program && program.title}
        extra={
          program && (
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu onClick={({ key }) => window.open(`//${settings['host']}${key}`, '_blank')}>
                  <Menu.Item className="py-2 px-3" key={`/programs/${program.id}`}>
                    {formatMessage(commonMessages.ui.previewIntroduction)}
                  </Menu.Item>
                  <Menu.Item className="py-2 px-3" key={`/programs/${program.id}/contents`}>
                    {formatMessage(commonMessages.ui.previewContent)}
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>{formatMessage(commonMessages.ui.preview)}</Button>
            </Dropdown>
          )
        }
      />

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
          <Tabs.TabPane tab={formatMessage(programMessages.label.programContent)} key="content">
            <ProgramContentAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage(programMessages.label.programSettings)} key="general">
            <ProgramSettingAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage(commonMessages.label.salesPlan)} key="plan">
            <ProgramPlanAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage(commonMessages.label.roleAdmin)} key="roles">
            <ProgramRoleAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage(commonMessages.label.publishAdmin)} key="publishing">
            <ProgramPublishingAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default ProgramAdminPage
