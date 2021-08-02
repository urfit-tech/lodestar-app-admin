import { Button, Checkbox, DatePicker, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { ActivitySessionProps } from '../../types/activity'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

type FieldProps = {
  title: string
  startedAt: Moment
  endedAt: Moment
  offlineLocation: string | null
  onlineLink: string | null
  threshold: number
}

const ActivitySessionAdminModal: React.FC<
  AdminModalProps & {
    activitySession?: ActivitySessionProps
    onSubmit?: (
      values: {
        title: string
        startedAt: Date
        endedAt: Date
        location: string | null
        onlineLink: string | null
        threshold: number | null
      },
      reset: () => void,
    ) => Promise<any>
    onRefetch?: () => void
  }
> = ({ activitySession, onSubmit, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [withThreshold, setWithThreshold] = useState(typeof activitySession?.threshold === 'number')

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        if (!onSubmit) {
          return
        }
        setLoading(true)
        const values = form.getFieldsValue()
        onSubmit(
          {
            title: values.title,
            startedAt: values.startedAt.toDate(),
            endedAt: values.endedAt.toDate(),
            location: values.offlineLocation,
            onlineLink: values.onlineLink,
            threshold: withThreshold ? values.threshold : null,
          },
          () => form.resetFields(),
        )
          .then(() => {
            onSuccess()
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(activityMessages.label.session)}
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
          title: activitySession?.title || '',
          startedAt: activitySession ? moment(activitySession.startedAt) : null,
          endedAt: activitySession ? moment(activitySession.endedAt) : null,
          offlineLocation: activitySession?.location || '',
          onlineLink: activitySession?.onlineLink || `https://meet.jit.si/${uuid()}`,
          threshold: activitySession?.threshold || null,
        }}
      >
        <Form.Item
          label={formatMessage(activityMessages.label.sessionTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.title),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.label.startedAt)}
          name="startedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.startedAt),
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
          label={formatMessage(commonMessages.label.endedAt)}
          name="endedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.endedAt),
              }),
            },
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            disabledDate={current => !!current && current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage(
            enabledModules.activity_online
              ? activityMessages.label.offlineActivityLocation
              : activityMessages.label.activityLocation,
          )}
          name="offlineLocation"
        >
          <Input />
        </Form.Item>
        {enabledModules.activity_online && (
          <Form.Item
            className="mr-2"
            label={formatMessage(activityMessages.label.onlineActivityLink)}
            name="onlineLink"
          >
            <ActivityOnlineLinkInput />
          </Form.Item>
        )}

        <Checkbox defaultChecked={withThreshold} onChange={e => setWithThreshold(e.target.checked)}>
          {formatMessage(activityMessages.label.threshold)}
        </Checkbox>
        <Form.Item className={withThreshold ? 'd-block' : 'd-none'} name="threshold">
          <InputNumber min={0} />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const ActivityOnlineLinkInput: React.VFC<{ value?: string; onChange?: (value: string) => void }> = ({
  value = '',
  onChange,
}) => {
  const { formatMessage } = useIntl()
  const isSystemLink = value.includes('https://meet.jit.si')
  const [systemLink] = useState(isSystemLink ? value : `https://meet.jit.si/${uuid()}`)
  const [customLink, setCustomLink] = useState(isSystemLink ? '' : value)
  const [check, setCheck] = useState(isSystemLink)

  return (
    <div className="d-flex align-items-center">
      <Input
        className="mr-3 flex-grow-1"
        onChange={e => {
          setCustomLink(e.target.value)
          onChange?.(e.target.value)
        }}
        disabled={check}
        value={check ? value : customLink}
      />
      <Checkbox
        className="flex-shrink-0"
        checked={check}
        onClick={() => {
          setCheck(!check)
          onChange?.(check ? customLink : systemLink)
        }}
      >
        {formatMessage(activityMessages.label.generateBySystem)}
      </Checkbox>
    </div>
  )
}

export default ActivitySessionAdminModal
