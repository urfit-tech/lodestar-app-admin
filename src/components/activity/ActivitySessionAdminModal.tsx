import { Button, Checkbox, DatePicker, Form, Input, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { ActivitySessionProps } from './ActivitySessionsAdminBlock'

type ActivitySessionAdminModalProps = AdminModalProps &
  FormComponentProps & {
    activitySession?: ActivitySessionProps
    onSubmit?: (
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setVisible: React.Dispatch<React.SetStateAction<boolean>>,
      values: any,
    ) => void
  }
const ActivitySessionAdminModal: React.FC<ActivitySessionAdminModalProps> = ({
  form,
  activitySession,
  onSubmit,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [withThreshold, setWithThreshold] = useState<boolean>(
    !!activitySession && typeof activitySession.threshold === 'number',
  )

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onSubmit) {
        onSubmit(setLoading, setVisible, {
          ...values,
          activitySessionId: activitySession ? activitySession.id : undefined,
          description: null,
          threshold: withThreshold ? values.threshold : null,
        })
      }
    })
  }

  return (
    <AdminModal
      title={formatMessage(activityMessages.term.session)}
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
        <Form.Item label={formatMessage(activityMessages.term.sessionTitle)} colon={false}>
          {form.getFieldDecorator('title', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.title) }],
            initialValue: activitySession ? activitySession.title : '',
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.startedAt)} colon={false}>
          {form.getFieldDecorator('startedAt', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.startedAt) }],
            initialValue: activitySession ? moment(activitySession.startedAt) : null,
          })(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => !!current && current < moment().startOf('day')}
            />,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.endedAt)} colon={false}>
          {form.getFieldDecorator('endedAt', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.endedAt) }],
            initialValue: activitySession ? moment(activitySession.endedAt) : null,
          })(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => !!current && current < moment().startOf('day')}
            />,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(activityMessages.term.location)} colon={false}>
          {form.getFieldDecorator('location', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.location) }],
            initialValue: activitySession ? activitySession.location : '',
          })(<Input />)}
        </Form.Item>

        <Checkbox defaultChecked={withThreshold} onChange={e => setWithThreshold(e.target.checked)}>
          {formatMessage(activityMessages.term.threshold)}
        </Checkbox>
        <Form.Item className={withThreshold ? 'd-block' : 'd-none'}>
          {form.getFieldDecorator('threshold', {
            initialValue: activitySession && activitySession.threshold ? activitySession.threshold : 0,
          })(<InputNumber min={0} />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ActivitySessionAdminModalProps>()(ActivitySessionAdminModal)
