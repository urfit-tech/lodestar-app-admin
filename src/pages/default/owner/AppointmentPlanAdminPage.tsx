import { Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../../components/admin'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import AppointmentPlanBasicForm from '../../../containers/appointment/AppointmentPlanBasicForm'
import AppointmentPlanHeader from '../../../containers/appointment/AppointmentPlanHeader'
import AppointmentPlanIntroForm from '../../../containers/appointment/AppointmentPlanIntroForm'
import AppointmentPlanPublishBlock from '../../../containers/appointment/AppointmentPlanPublishBlock'
import AppointmentPlanSaleForm from '../../../containers/appointment/AppointmentPlanSaleForm'
import AppointmentPlanScheduleBlock from '../../../containers/appointment/AppointmentPlanScheduleBlock'
import AppointmentPlanScheduleCreationModal from '../../../containers/appointment/AppointmentPlanScheduleCreationModal'
import { AppointmentPlanProvider } from '../../../contexts/AppointmentPlanContext'
import { commonMessages } from '../../../helpers/translation'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const messages = defineMessages({
  planSettings: { id: 'appointment.label.planSettings', defaultMessage: '方案設定' },
  planDescription: { id: 'appointment.label.planDescription', defaultMessage: '方案簡介' },
  salesSettings: { id: 'appointment.label.salesSettings', defaultMessage: '銷售方案' },
  scheduleSettings: { id: 'appointment.label.scheduleSettings', defaultMessage: '時段設定' },
})

const AppointmentPlanAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
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
            <Tabs.TabPane tab={formatMessage(messages.planSettings)} key="settings">
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.planSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                  <AppointmentPlanBasicForm />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(messages.planDescription)}</AdminBlockTitle>
                  <AppointmentPlanIntroForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={formatMessage(messages.salesSettings)} key="sale">
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.salesSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <AppointmentPlanSaleForm />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={formatMessage(messages.scheduleSettings)} key="schedule">
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.scheduleSettings)}</AdminPaneTitle>
                <div className="mb-5">
                  <AppointmentPlanScheduleCreationModal />
                </div>
                <AdminBlock>
                  <AppointmentPlanScheduleBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={formatMessage(commonMessages.label.publishAdmin)} key="publish">
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <AppointmentPlanPublishBlock />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      </StyledWrapper>
    </AppointmentPlanProvider>
  )
}

export default AppointmentPlanAdminPage
