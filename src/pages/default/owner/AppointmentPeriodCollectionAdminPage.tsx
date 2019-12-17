import { Icon } from 'antd'
import React, { useState } from 'react'
import { AdminPageTitle } from '../../../components/admin'
import { AppointmentPeriodCardProps } from '../../../components/appointment/AppointmentPeriodCard'
import AppointmentPeriodCollectionTabs from '../../../components/appointment/AppointmentPeriodCollectionTabs'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { ReactComponent as CalendarAltOIcon } from '../../../images/default/calendar-alt-o.svg'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)

  const periods: AppointmentPeriodCardProps[] = [
    {
      id: 'period-1',
      member: {
        name: '王大明',
      },
      appointmentPlanTitle: 'OOXX服務',
      startedAt: new Date('2019-12-22T20:00:00+0800'),
      endedAt: new Date('2019-12-22T21:00:00+0800'),
      creatorName: '我是老師',
    },
    {
      id: 'period-2',
      member: {
        name: 'Dan Lin',
        email: 'abc@gmail.com',
        phone: '0912345678',
      },
      appointmentPlanTitle: '線上真人品牌形象諮詢',
      startedAt: new Date('2019-12-21T20:00:00+0800'),
      endedAt: new Date('2019-12-21T21:00:00+0800'),
      creatorName: '我是老師',
    },
    {
      id: 'period-3',
      member: {
        name: '王美美',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-12-21T13:00:00+0800'),
      endedAt: new Date('2019-12-21T14:00:00+0800'),
      creatorName: '我是老師',
    },
    {
      id: 'period-4',
      member: {
        name: 'Dan Lin',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-12-19T20:00:00+0800'),
      endedAt: new Date('2019-12-19T21:00:00+0800'),
      creatorName: '我是老師',
    },
    {
      id: 'period-5',
      member: {
        name: '王美美',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-12-18T20:00:00+0800'),
      endedAt: new Date('2019-12-18T21:00:00+0800'),
      creatorName: '我是老師',
    },
    {
      id: 'period-7',
      member: {
        name: '王美美',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-11-18T19:00:00+0800'),
      endedAt: new Date('2019-11-18T21:00:00+0800'),
      creatorName: '我是老師',
    },
    {
      id: 'period-6',
      member: {
        name: '王美美',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-11-18T20:00:00+0800'),
      endedAt: new Date('2019-11-18T21:00:00+0800'),
      creatorName: '我是老師',
    },
  ]

  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>預約紀錄</span>
      </AdminPageTitle>

      <AppointmentPeriodCollectionTabs periods={periods} />
    </OwnerAdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
