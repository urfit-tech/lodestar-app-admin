import { Icon } from 'antd'
import React from 'react'
import { AdminPageTitle } from '../../../components/admin'
import { AppointmentPeriodCardProps } from '../../../components/appointment/AppointmentPeriodCard'
import AppointmentPeriodCollectionTabs from '../../../components/appointment/AppointmentPeriodCollectionTabs'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { ReactComponent as CalendarAltOIcon } from '../../../images/default/calendar-alt-o.svg'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const periods: AppointmentPeriodCardProps[] = [
    {
      id: 'period-1',
      avatarUrl:
        'https://images.unsplash.com/photo-1572628252713-5f0904beb2fa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
      member: {
        name: '王大明',
        email: 'wang@gmail.com',
      },
      appointmentPlanTitle: 'OOXX服務',
      startedAt: new Date('2019-12-22T20:00:00+0800'),
      endedAt: new Date('2019-12-22T21:00:00+0800'),
      creator: {
        id: 'instructor-1',
        name: '我是老師 1',
      },
    },
    {
      id: 'period-2',
      avatarUrl:
        'https://images.unsplash.com/flagged/photo-1574164908900-6275ca361157?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3024&q=80',
      member: {
        name: 'Dan Lin',
        email: 'abc@gmail.com',
        phone: '0912345678',
      },
      appointmentPlanTitle: '線上真人品牌形象諮詢',
      startedAt: new Date('2019-12-21T20:00:00+0800'),
      endedAt: new Date('2019-12-21T21:00:00+0800'),
      creator: {
        id: 'instructor-1',
        name: '我是老師 1',
      },
      link: 'https://css-doodle.com/',
    },
    {
      id: 'period-3',
      avatarUrl:
        'https://images.unsplash.com/photo-1575897368738-aa5401c4af7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=941&q=80',
      member: {
        name: '王美美',
        email: 'meimei@gmail.com',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-12-21T13:00:00+0800'),
      endedAt: new Date('2019-12-21T14:00:00+0800'),
      creator: {
        id: 'instructor-1',
        name: '我是老師 1',
      },
    },
    {
      id: 'period-4',
      avatarUrl:
        'https://images.unsplash.com/flagged/photo-1574164908900-6275ca361157?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3024&q=80',
      member: {
        name: 'Dan Lin',
        email: 'abc@gmail.com',
        phone: '0912345678',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-12-19T20:00:00+0800'),
      endedAt: new Date('2019-12-19T21:00:00+0800'),
      creator: {
        id: 'instructor-2',
        name: '我是老師 2',
      },
      link: 'https://www.google.com/',
    },
    {
      id: 'period-5',
      avatarUrl:
        'https://images.unsplash.com/photo-1575897368738-aa5401c4af7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=941&q=80',
      member: {
        name: '王美美',
        email: 'meimei@gmail.com',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-12-18T20:00:00+0800'),
      endedAt: new Date('2019-12-18T21:00:00+0800'),
      creator: {
        id: 'instructor-2',
        name: '我是老師 2',
      },
    },
    {
      id: 'period-7',
      avatarUrl:
        'https://images.unsplash.com/photo-1575897368738-aa5401c4af7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=941&q=80',
      member: {
        name: '王美美',
        email: 'meimei@gmail.com',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-11-18T19:00:00+0800'),
      endedAt: new Date('2019-11-18T21:00:00+0800'),
      creator: {
        id: 'instructor-A',
        name: '我是老師 A',
      },
    },
    {
      id: 'period-6',
      avatarUrl:
        'https://images.unsplash.com/photo-1575897368738-aa5401c4af7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=941&q=80',
      member: {
        name: '王美美',
        email: 'meimei@gmail.com',
      },
      appointmentPlanTitle: '這裡帶入交流標題',
      startedAt: new Date('2019-11-18T20:00:00+0800'),
      endedAt: new Date('2019-11-18T21:00:00+0800'),
      creator: {
        id: 'instructor-A',
        name: '我是老師 A',
      },
    },
  ]

  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>預約紀錄</span>
      </AdminPageTitle>

      <AppointmentPeriodCollectionTabs periods={periods} withSelector={true} />
    </OwnerAdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
