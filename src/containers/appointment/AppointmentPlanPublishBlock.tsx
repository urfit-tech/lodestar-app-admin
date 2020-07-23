import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'

const messages = defineMessages({
  noTitle: { id: 'appointment.text.noTitle', defaultMessage: '尚未設定方案名稱' },
  noDuration: { id: 'appointment.text.noDuration', defaultMessage: '尚未設定時間長度' },
  noListPrice: { id: 'appointment.text.noListPrice', defaultMessage: '尚未設定售價' },
  noPeriod: { id: 'appointment.text.noPeriod', defaultMessage: '尚未設定時段' },
  notCompleteNotation: {
    id: 'appointment.text.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可由此發佈',
  },
  unpublishedNotation: {
    id: 'appointment.text.unpublishedNotation',
    defaultMessage: '預約方案未發佈，此方案並不會顯示在頁面上，學生也不能購買此方案。',
  },
  publishedNotation: {
    id: 'appointment.text.publishedNotation',
    defaultMessage: '預約方案已經發佈，學生將能購買預約。',
  },
})

const AppointmentPlanPublishBlock: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loadingAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(AppointmentPlanContext)
  const [publishAppointmentPlan] = useMutation<types.PUBLISH_APPOINTMENT_PLAN, types.PUBLISH_APPOINTMENT_PLANVariables>(
    PUBLISH_APPOINTMENT_PLAN,
  )

  if (loadingAppointmentPlan || !appointmentPlan) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  !appointmentPlan.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tab: 'settings',
    })
  !appointmentPlan.duration &&
    checklist.push({
      id: 'NO_DURATION',
      text: formatMessage(messages.noDuration),
      tab: 'sale',
    })
  !appointmentPlan.listPrice &&
    checklist.push({
      id: 'NO_LIST_PRICE',
      text: formatMessage(messages.noListPrice),
      tab: 'sale',
    })
  !appointmentPlan.periods.length &&
    checklist.push({
      id: 'NO_PERIOD',
      text: formatMessage(messages.noPeriod),
      tab: 'schedule',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !appointmentPlan.isPublished ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(messages.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(messages.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishAppointmentPlan({
      variables: {
        appointmentPlanId: appointmentPlan.id,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        refetchAppointmentPlan && refetchAppointmentPlan()
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
