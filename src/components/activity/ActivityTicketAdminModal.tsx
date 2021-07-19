import { Button, Cascader, DatePicker, Form, Input, InputNumber, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import moment, { Moment } from 'moment'
import { toPairs } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { handleError, notEmpty } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import { ActivitySessionProps, ActivityTicketProps, ActivityTicketSessionProps } from '../../types/activity'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import AdminBraftEditor from '../form/AdminBraftEditor'

type FieldProps = {
  title: string
  sessions: string[][]
  isPublished: 'public' | 'private'
  startedAt: Moment
  endedAt: Moment
  price: number
  count: number
  description: EditorState
}

const ActivityTicketAdminModal: React.FC<
  AdminModalProps & {
    activityTicket?: ActivityTicketProps & {
      sessions: ActivityTicketSessionProps[]
    }
    activitySessions: Pick<ActivitySessionProps, 'id' | 'title' | 'location' | 'onlineLink'>[]
    onSubmit?: (values: {
      title: string
      sessions: string[][]
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
  const { enabledModules } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  const activitySessionOptions = generateSessionOptions({
    activitySessions,
    translation: {
      online: formatMessage(activityMessages.label.onlineActivity),
      offline: formatMessage(activityMessages.label.offlineActivity),
      both: formatMessage(activityMessages.label.onlineAndOfflineActivity),
    },
    isOnlineActivity: !!enabledModules.activity_online,
  })

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        if (!onSubmit) {
          return
        }
        setLoading(true)
        const values = form.getFieldsValue()
        onSubmit({
          title: values.title,
          sessions: values.sessions.filter(notEmpty).map(v => (v.length === 1 ? v[0].split('_') : v)),
          isPublished: values.isPublished === 'public',
          startedAt: values.startedAt.toDate(),
          endedAt: values.endedAt.toDate(),
          price: values.price,
          count: values.count,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
        })
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
      title={formatMessage(activityMessages.label.ticketPlan)}
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
          sessions: activityTicket?.sessions ? generateInitialSessions(activityTicket.sessions) : null,
          price: activityTicket?.price || 0,
          count: activityTicket?.count || 0,
          description: activityTicket ? BraftEditor.createEditorState(activityTicket.description) : null,
        }}
      >
        <Form.Item
          label={formatMessage(activityMessages.label.ticketPlanTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(activityMessages.label.ticketPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={formatMessage(activityMessages.label.selectSession)}>
          <Form.List name="sessions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <div key={field.key} className="d-flex">
                    <Form.Item className="flex-grow-1" {...field}>
                      <Cascader
                        options={activitySessionOptions}
                        placeholder={formatMessage(activityMessages.label.selectSessionAndType)}
                      />
                    </Form.Item>
                    {fields.length > 0 && (
                      <Button
                        type="link"
                        onClick={() => remove(field.name)}
                        className="flex-shrink-0 d-flex"
                        icon={<TrashOIcon className="m-auto" />}
                      />
                    )}
                  </div>
                ))}

                <Form.Item>
                  <Button type="link" icon={<PlusIcon className="mr-2" />} className="p-0" onClick={() => add()}>
                    {formatMessage(activityMessages.ui.addTicketSession)}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item label={formatMessage(activityMessages.label.published)} name="isPublished">
          <Radio.Group>
            <Radio value="public">{formatMessage(activityMessages.status.publishedTicket)}</Radio>
            <Radio value="private">{formatMessage(activityMessages.status.notPublishedTicket)}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={formatMessage(activityMessages.label.ticketStartedAt)}
          name="startedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(activityMessages.label.ticketStartedAt),
              }),
            },
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            disabledDate={current => current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage(activityMessages.label.ticketEndedAt)}
          name="endedAt"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(activityMessages.label.ticketEndedAt),
              }),
            },
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            disabledDate={current => current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.listPrice)} name="price">
          <InputNumber min={0} formatter={value => `NT$ ${value}`} parser={value => value?.replace(/\D/g, '') || ''} />
        </Form.Item>
        <Form.Item label={formatMessage(activityMessages.label.limit)} name="count">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item label={formatMessage(activityMessages.label.description)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const generateInitialSessions = (sessions: ActivityTicketSessionProps[]) =>
  sessions
    .map(({ id, type, location, onlineLink }) => {
      const existingSessionTypes = toPairs({
        location,
        onlineLink,
      })
        .filter(([, value]) => value)
        .map(
          ([key]) =>
            ({
              location: 'offline',
              onlineLink: 'online',
            }[key]),
        )

      if (['online', 'offline'].every(v => existingSessionTypes.includes(v))) {
        return [id, type]
      }

      if (['online', 'offline'].some(v => existingSessionTypes.includes(v))) {
        return [`${id}_${type}`]
      }

      return undefined
    })
    .filter(notEmpty)

const generateSessionOptions = ({
  activitySessions,
  translation,
  isOnlineActivity,
}: {
  activitySessions: Pick<ActivitySessionProps, 'id' | 'title' | 'location' | 'onlineLink'>[]
  translation: {
    [key: string]: string
  }
  isOnlineActivity: boolean
}) =>
  activitySessions
    .map(({ id, title, ...address }) => {
      const existingSessionTypes = toPairs(address)
        .filter(([, value]) => value)
        .map(
          ([key]) =>
            ({
              location: 'offline',
              onlineLink: 'online',
            }[key]),
        )

      if (['online', 'offline'].every(v => existingSessionTypes.includes(v))) {
        return {
          value: id,
          label: title,
          children: [
            {
              value: 'online',
              label: translation['online'],
            },
            {
              value: 'offline',
              label: translation['offline'],
            },
            {
              value: 'both',
              label: translation['both'],
            },
          ],
        }
      }

      if (['online', 'offline'].some(v => existingSessionTypes.includes(v))) {
        const [sessionType] = existingSessionTypes
        const sessionTypeLabel = {
          offline: translation['offline'],
          online: translation['online'],
        }[sessionType]

        return {
          value: `${id}_${sessionType}`,
          label: isOnlineActivity ? `${title} / ${sessionTypeLabel}` : title,
        }
      }

      return undefined
    })
    .filter(notEmpty)

export default ActivityTicketAdminModal
