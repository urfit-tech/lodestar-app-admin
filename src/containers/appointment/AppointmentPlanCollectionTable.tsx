import React from 'react'
import AppointmentPlanCollectionTableComponent, {
  AppointmentPlanProps,
} from '../../components/appointment/AppointmentPlanCollectionTable'

const AppointmentPlanCollectionTable: React.FC = () => {
  // ! fake data
  const appointmentPlans: AppointmentPlanProps[] = [
    {
      id: 'appointment-plan-1',
      creatorName: '小美',
      title: 'XXXXXX服務',
      duration: 60,
      listPrice: 500,
      enrollment: 1,
      isPublished: true,
    },
    {
      id: 'appointment-plan-2',
      creatorName: '小美',
      title: '面試諮詢',
      duration: 120,
      listPrice: 500,
      enrollment: 0,
      isPublished: false,
    },
    {
      id: 'appointment-plan-3',
      creatorName: 'Alex Wang',
      title: '商業分析顧問諮詢商業分析顧我是很長的方案名稱方案名稱方案名稱方案名',
      duration: 20,
      listPrice: 290,
      enrollment: 12,
      isPublished: true,
    },
    {
      id: 'appointment-plan-4',
      creatorName: '王麗莉',
      title: 'OOOOO服務',
      duration: 30,
      listPrice: 6400,
      enrollment: 0,
      isPublished: false,
    },
    {
      id: 'appointment-plan-5',
      creatorName: '陳一',
      title: 'XX服務',
      duration: 30,
      listPrice: 500,
      enrollment: 23,
      isPublished: true,
    },
    {
      id: 'appointment-plan-6',
      creatorName: '李美',
      title: 'OO諮詢',
      duration: 60,
      listPrice: 500,
      enrollment: 4,
      isPublished: true,
    },
  ]

  return <AppointmentPlanCollectionTableComponent appointmentPlans={appointmentPlans} />
}

export default AppointmentPlanCollectionTable
