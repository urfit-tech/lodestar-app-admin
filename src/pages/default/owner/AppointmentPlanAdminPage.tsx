import { Tabs } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../../components/admin'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import AppointmentPlanBasicForm from '../../../containers/appointment/AppointmentPlanBasicForm'
import { AppointmentPlanProvider } from '../../../containers/appointment/AppointmentPlanContext'
import AppointmentPlanHeader from '../../../containers/appointment/AppointmentPlanHeader'
import AppointmentPlanIntroForm from '../../../containers/appointment/AppointmentPlanIntroForm'
import AppointmentPlanSaleForm from '../../../containers/appointment/AppointmentPlanSaleForm'
import AppointmentPlanSessionBlock from '../../../containers/appointment/AppointmentPlanSessionBlock'
import AppointmentPlanSessionCreationModal from '../../../containers/appointment/AppointmentPlanSessionCreationModal'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const AppointmentPlanAdminPage: React.FC = () => {
  const { match } = useRouter<{ appointmentPlanId: string }>()
  const appointmentPlanId = match.params.appointmentPlanId

  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)

  return (
    <AppointmentPlanProvider appointmentPlanId={appointmentPlanId}>
      <StyledWrapper>
        <AppointmentPlanHeader appointmentPlanId={appointmentPlanId} />

        <StyledLayoutContent>
          <Tabs
            defaultActiveKey="settings"
            activeKey={activeKey || 'settings'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane tab="方案設定" key="settings">
              <div className="container py-5">
                <AdminPaneTitle>方案設定</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>基本設定</AdminBlockTitle>
                  <AppointmentPlanBasicForm />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>方案簡介</AdminBlockTitle>
                  <AppointmentPlanIntroForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="銷售方案" key="sale">
              <div className="container py-5">
                <AdminPaneTitle>銷售方案</AdminPaneTitle>
                <AdminBlock>
                  <AppointmentPlanSaleForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="時段設定" key="session">
              <div className="container py-5">
                <AdminPaneTitle>時段</AdminPaneTitle>
                <div className="mb-5">
                  <AppointmentPlanSessionCreationModal />
                </div>
                <AdminBlock>
                  <AppointmentPlanSessionBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="發佈" key="publish">
              <div className="container py-5">
                <AdminPaneTitle>發布設定</AdminPaneTitle>
                <AdminBlock></AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      </StyledWrapper>
    </AppointmentPlanProvider>
  )
}

export default AppointmentPlanAdminPage
