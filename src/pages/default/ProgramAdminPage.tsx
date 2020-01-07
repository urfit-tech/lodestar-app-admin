import { Button, Dropdown, Menu, PageHeader, Tabs } from 'antd'
import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import ProgramContentAdminPane from '../../components/program/ProgramContentAdminPane'
import ProgramPlanAdminPane from '../../components/program/ProgramPlanAdminPane'
import ProgramPublishingAdminPane from '../../components/program/ProgramPublishingAdminPane'
import ProgramSettingAdminPane from '../../components/program/ProgramSettingAdminPane'
import ProgramRoleAdminPane from '../../containers/program/ProgramRoleAdminPane'
import AppContext from '../../contexts/AppContext'
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
                    預覽簡介
                  </Menu.Item>
                  <Menu.Item className="py-2 px-3" key={`/programs/${program.id}/contents`}>
                    預覽內容
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>預覽</Button>
            </Dropdown>
          )
        }
      />

      <div style={{ backgroundColor: '#f7f8f8', minHeight: 'calc(100vh - 64px)' }}>
        <Tabs
          activeKey={active}
          onChange={setActive}
          renderTabBar={(tabsProps, DefaultTabBar) => {
            const TabBar = DefaultTabBar as typeof React.Component
            return (
              <div style={{ backgroundColor: 'white' }}>
                <div className="container">
                  <TabBar {...tabsProps} />
                </div>
              </div>
            )
          }}
        >
          <Tabs.TabPane tab="課程內容" key="content">
            <ProgramContentAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="課程設定" key="general">
            <ProgramSettingAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="銷售方案" key="plan">
            <ProgramPlanAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="身份管理" key="roles">
            <ProgramRoleAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="發佈" key="publishing">
            <ProgramPublishingAdminPane program={program} onRefetch={refetchProgram} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  )
}

export default ProgramAdminPage
