import { Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageBlock } from '../../components/admin'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import AppointmentPlanCollectionTable from './AppointmentPlanCollectionTable'

const messages = defineMessages({
  notPublished: { id: 'appointment.status.notPublished', defaultMessage: '未發佈' },
})

const AppointmentPlanCollectionTabs: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const { enabledModules } = useApp()
  const [counts, setCounts] = useState<{ [key: string]: number }>({})

  const tabContents: {
    key: string
    tab: string
    condition: hasura.GET_APPOINTMENT_PLAN_COLLECTION_ADMINVariables['condition']
    orderBy?: hasura.GET_APPOINTMENT_PLAN_COLLECTION_ADMINVariables['orderBy']
    withAppointmentButton?: Boolean
    permissionIsAllowed: boolean
  }[] = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      condition: {
        published_at: { _is_null: false },
        is_private: { _eq: false },
      },
      orderBy: [{ updated_at: 'desc_nulls_last' as hasura.order_by }],
      withAppointmentButton: true,
      permissionIsAllowed: true,
    },
    {
      key: 'privatelyPublish',
      tab: formatMessage(commonMessages.status.privatelyPublish),
      condition: {
        published_at: { _is_null: false },
        is_private: { _eq: true },
      },
      withAppointmentButton: true,
      permissionIsAllowed: !!enabledModules.private_appointment_plan,
    },
    {
      key: 'notPublished',
      tab: formatMessage(messages.notPublished),
      condition: {
        published_at: { _is_null: true },
      },
      withAppointmentButton: false,
      permissionIsAllowed: true,
    },
  ]

  return (
    <Tabs defaultActiveKey="published">
      {tabContents
        .filter(v => v.permissionIsAllowed)
        .map(tabContent => (
          <Tabs.TabPane
            key={tabContent.key}
            tab={`${tabContent.tab} ${typeof counts[tabContent.key] === 'number' ? `(${counts[tabContent.key]})` : ''}`}
          >
            <AdminPageBlock>
              {currentMemberId ? (
                <AppointmentPlanCollectionTable
                  condition={{
                    ...tabContent.condition,
                    creator_id: { _eq: currentUserRole === 'content-creator' ? currentMemberId : undefined },
                  }}
                  orderBy={tabContent?.orderBy}
                  withAppointmentButton={tabContent?.withAppointmentButton}
                  onReady={count =>
                    count !== counts[tabContent.key] &&
                    setCounts({
                      ...counts,
                      [tabContent.key]: count,
                    })
                  }
                />
              ) : (
                <Skeleton active />
              )}
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
    </Tabs>
  )
}
export default AppointmentPlanCollectionTabs
