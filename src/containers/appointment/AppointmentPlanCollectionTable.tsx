import React from 'react'
import { AppointmentPlanProps } from '../../components/appointment/AppointmentPlanCollectionTable'
import AppointmentPlanCollectionTableComponent from '../../components/appointment/AppointmentPlanCollectionTable'

const AppointmentPlanCollectionTable: React.FC = () => {
  // ! fake data
  const appointmentPlans: AppointmentPlanProps[] = [
    {
      id: 'appointment-plan-1',
      creator: '小美',
      title: 'XXXXXX服務',
      listPrice: 500,
      enrollment: 1,
      isPublished: true,
    },
    {
      id: 'appointment-plan-2',
      creator: '小美',
      title: '面試諮詢',
      listPrice: 500,
      enrollment: 0,
      isPublished: false,
    },
    {
      id: 'appointment-plan-3',
      creator: 'Alex Wang',
      title: '商業分析顧問諮詢商業分析顧我是很長的方案名稱方案名稱方案名稱方案名...',
      listPrice: 290,
      enrollment: 12,
      isPublished: true,
    },
    {
      id: 'appointment-plan-4',
      creator: '王麗莉',
      title: 'OOOOO服務',
      listPrice: 6400,
      enrollment: 0,
      isPublished: false,
    },
    {
      id: 'appointment-plan-5',
      creator: '陳一',
      title: 'XX服務',
      listPrice: 500,
      enrollment: 23,
      isPublished: true,
    },
    {
      id: 'appointment-plan-6',
      creator: '李美',
      title: 'OO諮詢',
      listPrice: 500,
      enrollment: 4,
      isPublished: true,
    },
  ]

  return <AppointmentPlanCollectionTableComponent appointmentPlans={appointmentPlans} />
}

export default AppointmentPlanCollectionTable
