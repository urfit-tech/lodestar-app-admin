import { Skeleton } from 'antd'
import React, { useContext } from 'react'
import AdminPublishBlock, { checklistItemProps, PublishStatus } from '../../components/admin/AdminPublishBlock'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanPublishBlock: React.FC = () => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  if (!appointmentPlan) {
    return <Skeleton active />
  }

  const checklist: (checklistItemProps | null)[] = [
    appointmentPlan.title
      ? null
      : {
          id: 'NO_TITLE',
          text: '尚未設定方案名稱',
          tabkey: 'settings',
        },
    appointmentPlan.duration
      ? null
      : {
          id: 'NO_DURATION',
          text: '尚未設定時間長度',
          tabkey: 'sale',
        },
    appointmentPlan.listPrice
      ? null
      : {
          id: 'NO_LIST_PRICE',
          text: '尚未設定售價',
          tabkey: 'sale',
        },
    appointmentPlan.sessions.length
      ? null
      : {
          id: 'NO_SESSION',
          text: '尚未設定時段',
          tabkey: 'session',
        },
  ].filter(v => v)

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !appointmentPlan.isPublished ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? ['尚有未完成項目', '請填寫以下必填資料，填寫完畢即可由此發佈']
      : publishStatus === 'ordinary'
      ? ['尚未發佈', '預約方案未發佈，此方案並不會顯示在頁面上，學生也不能購買此方案。']
      : publishStatus === 'success'
      ? ['已發佈', '預約方案已經發佈，學生將能購買預約。']
      : []

  return <AdminPublishBlock type={publishStatus} title={title} description={description} checklist={checklist} />
}

export default AppointmentPlanPublishBlock
