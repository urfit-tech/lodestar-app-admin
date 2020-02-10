import { Button, Dropdown, Menu, PageHeader, Tabs } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
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
  const { history, match } = useRouter<{ programId: string }>()
  const programId = match.params.programId
  const { program, refetch: refetchProgram } = useProgram(programId)
  const [active, setActive] = useQueryParam('active', StringParam)
  const app = useContext(AppContext)

  useEffect(() => {
    !active && setActive('content')
  }, [active, setActive])

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
                <Menu onClick={({ key }) => window.open(`//${app.domain}${key}`)}>
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

      <div style={{ backgroundColor: '#f7f8f8', minHeight: 'calc(100vh - 64px)' }}>
        <Tabs
          activeKey={active}
          onChange={setActive}
          renderTabBar={(tabsProps, DefaultTabBar) => (
            <div style={{ backgroundColor: 'white' }}>
              <div className="container text-center">
                <DefaultTabBar {...tabsProps} />
              </div>
            </div>
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
      </div>
    </>
  )
}

export default ProgramAdminPage
