import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
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
            onlineLink: values.onlineLink || null,
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
          onlineLink: activitySession?.onlineLink || '',
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

const linkTypes = [
  { value: '', name: activityMessages.label.null },
  { value: 'system', name: activityMessages.label.generateBySystem },
  { value: 'custom', name: activityMessages.label.customOnlineLink },
  { value: 'media', name: activityMessages.label.embedMedia },
]

const ActivityOnlineLinkInput: React.VFC<{ value?: string; onChange?: (value: string) => void }> = ({
  value = '',
  onChange,
}) => {
  const { formatMessage } = useIntl()
  const [linkType, setLinkType] = useState<'system' | 'media' | 'custom' | ''>(
    value.includes('https://meet.jit.si') ? 'system' : value.includes('<iframe>') ? 'media' : 'custom',
  )

  return (
    <div className="d-flex align-items-center">
      <Select
        style={{ width: 180 }}
        value={linkType}
        onChange={value => {
          setLinkType(value)
          if (value === 'system') {
            onChange?.(`https://meet.jit.si/${uuid()}`)
            return
          }
          onChange?.('')
        }}
      >
        {linkTypes.map(type => (
          <Select.Option key={type.value} value={type.value}>
            {formatMessage(type.name)}
          </Select.Option>
        ))}
      </Select>
      <Input
        className="flex-grow-1"
        disabled={['system', ''].includes(linkType)}
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  )
}

export default ActivitySessionAdminModal
