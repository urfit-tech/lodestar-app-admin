import { Button, Checkbox, DatePicker, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { ActivitySessionProps } from '../../types/activity'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const ActivitySessionAdminModal: React.FC<
  AdminModalProps & {
    activitySession?: ActivitySessionProps
    onSubmit?: (values: {
      title: string
      startedAt: Date
      endedAt: Date
      location: string
      threshold: number | null
    }) => Promise<any>
    refetch?: () => void
  }
> = ({ activitySession, onSubmit, refetch, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [loading, setLoading] = useState(false)
  const [withThreshold, setWithThreshold] = useState(typeof activitySession?.threshold === 'number')

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then((values: any) => {
        if (!onSubmit) {
          return
        }
        setLoading(true)
        onSubmit({
          title: values.title,
          startedAt: values.startedAt.toDate(),
          endedAt: values.endedAt.toDate(),
          location: values.location,
          threshold: withThreshold ? values.threshold : null,
        })
          .then(() => {
            refetch && refetch()
            setVisible(false)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(activityMessages.term.session)}
      maskClosable={false}
      footer={null}
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
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: activitySession?.title || '',
          startedAt: activitySession ? moment(activitySession.startedAt) : null,
          endedAt: activitySession ? moment(activitySession.endedAt) : null,
          location: activitySession?.location || '',
          threshold: activitySession?.threshold || null,
        }}
      >
        <Form.Item
          label={formatMessage(activityMessages.term.sessionTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.term.startedAt)}
          name="startedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.startedAt),
              }),
            },
          ]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            disabledDate={current => !!current && current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.term.endedAt)}
          name="endedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.endedAt),
              }),
            },
          ]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            disabledDate={current => !!current && current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage(activityMessages.term.location)}
          name="location"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(activityMessages.term.location),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Checkbox defaultChecked={withThreshold} onChange={e => setWithThreshold(e.target.checked)}>
          {formatMessage(activityMessages.term.threshold)}
        </Checkbox>
        <Form.Item className={withThreshold ? 'd-block' : 'd-none'} name="threshold">
          <InputNumber min={0} />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default ActivitySessionAdminModal
