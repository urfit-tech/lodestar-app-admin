import React from 'react'
import { Table } from 'antd'

export type AppointmentPlanProps = {
  id: string
  avatarlUrl?: string | null
  creator: string
  title: string
  listPrice: number
  enrollment: number
  isPublished: boolean
}

const AppointmentPlanCollectionTable: React.FC<{
  appointmentPlans: AppointmentPlanProps[]
}> = ({ appointmentPlans }) => {
  return <Table />
}

export default AppointmentPlanCollectionTable
