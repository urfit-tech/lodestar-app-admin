import { Button, DatePicker, Icon, Input, InputNumber, Radio, Select } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import StyledBraftEditor from '../common/StyledBraftEditor'
import { ActivityTicketProps } from './ActivityTicket'

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

type ActivityTicketAdminModalProps = FormComponentProps &
  AdminModalProps & {
    activityTicket?: ActivityTicketProps
    activitySessions: {
      id: string
      title: string
    }[]
    onSubmit?: (
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setVisible: React.Dispatch<React.SetStateAction<boolean>>,
      values: any,
    ) => void
  }
const ActivityTicketAdminModal: React.FC<ActivityTicketAdminModalProps> = ({
  form,
  activityTicket,
  activitySessions,
  onSubmit,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onSubmit) {
        onSubmit(setLoading, setVisible, {
          ...values,
          activityTicketId: activityTicket ? activityTicket.id : undefined,
          isPublished: values.isPublished === 'public',
          count: parseInt(values.count),
          description:
            values.description && values.description.getCurrentContent().hasText() ? values.description.toRAW() : null,
        })
      }
    })
  }

  return (
    <AdminModal
      icon={<Icon type="file-add" />}
      title={formatMessage(activityMessages.term.ticketPlan)}
      maskClosable={false}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form hideRequiredMark>
        <Form.Item label={formatMessage(activityMessages.term.ticketPlanTitle)} colon={false}>
          {form.getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(activityMessages.term.ticketPlanTitle),
                }),
              },
            ],
            initialValue: activityTicket ? activityTicket.title : '',
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(activityMessages.term.includingSessions)} colon={false}>
          {form.getFieldDecorator('sessionIds', {
            initialValue: activityTicket
              ? activityTicket.activitySessionTickets.map(sessionTicket => sessionTicket.activitySession.id)
              : [],
          })(
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
            </Select>,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(messages.published)} colon={false}>
          {form.getFieldDecorator('isPublished', {
            initialValue: !activityTicket || activityTicket.isPublished ? 'public' : 'private',
          })(
            <Radio.Group>
              <Radio value="public">{formatMessage(messages.publishedTicket)}</Radio>
              <Radio value="private">{formatMessage(messages.notPublishedTicket)}</Radio>
            </Radio.Group>,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(messages.ticketStartedAt)} colon={false}>
          {form.getFieldDecorator('startedAt', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(messages.ticketStartedAt),
                }),
              },
            ],
            initialValue: activityTicket ? moment(activityTicket.startedAt) : null,
          })(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => !!current && current < moment().startOf('day')}
            />,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(messages.ticketEndedAt)} colon={false}>
          {form.getFieldDecorator('endedAt', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, { field: formatMessage(messages.ticketEndedAt) }),
              },
            ],
            initialValue: activityTicket ? moment(activityTicket.endedAt) : null,
          })(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => !!current && current < moment().startOf('day')}
            />,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.listPrice)} colon={false}>
          {form.getFieldDecorator('price', {
            rules: [{ type: 'number' }],
            initialValue: activityTicket ? activityTicket.price : 0,
          })(
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />,
          )}
        </Form.Item>

        <Form.Item label={formatMessage(messages.limit)}>
          {form.getFieldDecorator('count', {
            rules: [{ type: 'number' }],
            initialValue: activityTicket ? activityTicket.count : 1,
          })(<InputNumber min={1} />)}
        </Form.Item>

        <Form.Item label={formatMessage(activityMessages.term.description)} colon={false}>
          {form.getFieldDecorator('description', {
            initialValue: activityTicket ? BraftEditor.createEditorState(activityTicket.description) : null,
          })(
            <StyledBraftEditor
              language="zh-hant"
              controls={['text-color', 'bold', 'list-ol', 'list-ul', { key: 'remove-styles', title: '清除樣式' }]}
              contentClassName="short-bf-content"
            />,
          )}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ActivityTicketAdminModalProps>()(ActivityTicketAdminModal)
