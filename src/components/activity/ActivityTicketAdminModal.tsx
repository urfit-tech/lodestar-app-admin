import { Button, DatePicker, Form, Input, InputNumber, Radio, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { ActivityTicketProps } from '../../types/activity'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import AdminBraftEditor from '../form/AdminBraftEditor'

const messages = defineMessages({
  published: { id: 'activity.label.published', defaultMessage: '是否開賣' },
  publishedTicket: { id: 'activity.status.publishedTicket', defaultMessage: '發售，活動上架後立即開賣' },
  notPublishedTicket: {
    id: 'activity.status.notPublishedTicket',
    defaultMessage: '停售，該票券暫停對外銷售，並從購票頁中隱藏',
  },
  ticketStartedAt: { id: 'activity.label.ticketStartedAt', defaultMessage: '售票開始時間' },
  ticketEndedAt: { id: 'activity.label.ticketEndedAt', defaultMessage: '售票結束時間' },
  limit: { id: 'activity.label.limit', defaultMessage: '張數限制' },
  selectSession: { id: 'activity.warning.selectSession', defaultMessage: '選擇場次' },
})

const ActivityTicketAdminModal: React.FC<
  AdminModalProps & {
    activityTicket?: ActivityTicketProps & {
      sessions: {
        id: string
        title: string
      }[]
    }
    activitySessions: {
      id: string
      title: string
    }[]
    onSubmit?: (values: {
      title: string
      sessionIds: string[]
      isPublished: boolean
      startedAt: Date | null
      endedAt: Date | null
      price: number
      count: number
      description: string | null
    }) => Promise<any>
    onRefetch?: () => void
  }
> = ({ activityTicket, activitySessions, onSubmit, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then((values: any) => {
        if (!onSubmit) {
          return
        }
        setLoading(true)
        onSubmit({
          title: values.title,
          sessionIds: values.sessionIds,
          isPublished: values.isPublished === 'public',
          startedAt: values.startedAt.toDate(),
          endedAt: values.endedAt.toDate(),
          price: values.price,
          count: parseInt(values.count),
          description:
            values.description && values.description.getCurrentContent().hasText() ? values.description.toRAW() : null,
        })
          .then(() => {
            onRefetch && onRefetch()
            onSuccess()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(activityMessages.term.ticketPlan)}
      maskClosable={false}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: activityTicket?.title || '',
          sessionIds: activityTicket?.sessions.map(session => session.id) || [],
          isPublished: activityTicket?.isPublished ? 'public' : 'private',
          startedAt: activityTicket ? moment(activityTicket.startedAt) : null,
          endedAt: activityTicket ? moment(activityTicket.endedAt) : null,
          price: activityTicket?.price || 0,
          count: activityTicket?.count || 0,
          description: activityTicket ? BraftEditor.createEditorState(activityTicket.description) : null,
        }}
      >
        <Form.Item
          label={formatMessage(activityMessages.term.ticketPlanTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(activityMessages.term.ticketPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(activityMessages.term.includingSessions)} name="sessionIds">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={formatMessage(messages.selectSession)}
            onChange={() => {}}
          >
            {activitySessions.map(session => (
              <Select.Option key={session.id} value={session.id}>
                {session.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={formatMessage(messages.published)} name="isPublished">
          <Radio.Group>
            <Radio value="public">{formatMessage(messages.publishedTicket)}</Radio>
            <Radio value="private">{formatMessage(messages.notPublishedTicket)}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={formatMessage(messages.ticketStartedAt)}
          name="startedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(messages.ticketStartedAt),
              }),
            },
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            disabledDate={current => !!current && current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage(messages.ticketEndedAt)}
          name="endedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, { field: formatMessage(messages.ticketEndedAt) }),
            },
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            disabledDate={current => !!current && current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.listPrice)} name="price">
          <InputNumber
            min={0}
            formatter={value => `NT$ ${value}`}
            parser={value => (value ? value.replace(/\D/g, '') : '')}
          />
        </Form.Item>
        <Form.Item label={formatMessage(messages.limit)} name="count">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item label={formatMessage(activityMessages.term.description)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default ActivityTicketAdminModal
