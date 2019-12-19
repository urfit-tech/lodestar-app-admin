import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import types from '../../types'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanPublishBlock: React.FC = () => {
  const { loadingAppointmentPlan, appointmentPlan, refetch } = useContext(AppointmentPlanContext)
  const [publishAppointmentPlan] = useMutation<types.PUBLISH_APPOINTMENT_PLAN, types.PUBLISH_APPOINTMENT_PLANVariables>(
    PUBLISH_APPOINTMENT_PLAN,
  )

  if (loadingAppointmentPlan || !appointmentPlan) {
    return <Skeleton active />
  }

  const checklist: (ChecklistItemProps | null)[] = [
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
    appointmentPlan.periods.length
      ? null
      : {
          id: 'NO_PERIOD',
          text: '尚未設定時段',
          tabkey: 'schedule',
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

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishAppointmentPlan({
      variables: {
        appointmentPlanId: appointmentPlan.id,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        refetch && refetch()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      title={title}
      description={description}
      checklist={checklist}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_APPOINTMENT_PLAN = gql`
  mutation PUBLISH_APPOINTMENT_PLAN($appointmentPlanId: uuid!, $publishedAt: timestamptz) {
    update_appointment_plan(where: { id: { _eq: $appointmentPlanId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default AppointmentPlanPublishBlock
