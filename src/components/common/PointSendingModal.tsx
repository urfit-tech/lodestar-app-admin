import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMemberSummaryCollection } from '../../hooks/member'
import types from '../../types'
import AdminModal from '../admin/AdminModal'
import MemberSelector from './MemberSelector'

const messages = defineMessages({
  sendingPoint: { id: 'promotion.label.sendingPoint', defaultMessage: '發送點數' },
  sendPoint: { id: 'promotion.ui.sendPoint', defaultMessage: '發送點數' },
  selectMember: { id: 'promotion.label.selectMember', defaultMessage: '選擇會員' },
  description: { id: 'promotion.label.description', defaultMessage: '項目' },
  increasePoints: { id: 'promotion.label.increasePoints', defaultMessage: '增加點數' },
  availableDateRange: { id: 'promotion.label.availableDateRange', defaultMessage: '有效期限' },
  noteForAdmins: { id: 'promotion.label.noteForAdmins', defaultMessage: '備註(僅供管理員檢視)' },
  descriptionPlaceholder: { id: 'promotion.text.descriptionPlaceholder', defaultMessage: '請填寫項目名稱' },
})

const PointSendingModal: React.FC<{
  onRefetch?: () => Promise<any>
}> = ({ onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { members } = useMemberSummaryCollection()
  const sendPoints = useSendPoints()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields().then((values: any) => {
      setLoading(true)
      sendPoints(values)
        .then(() => onRefetch && onRefetch().then(() => setVisible(false)))
        .catch(handleError)
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminModal
      title={formatMessage(messages.sendingPoint)}
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(messages.sendPoint)}
        </Button>
      )}
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
    >
      <Form form={form} layout="vertical" colon={false} hideRequiredMark initialValues={{ points: 0 }}>
        <Form.Item
          label={formatMessage(messages.selectMember)}
          name="memberIds"
          rules={[{ required: true, message: formatMessage(errorMessages.form.memberIdIsRequired) }]}
        >
          <MemberSelector mode="multiple" members={members} />
        </Form.Item>
        <Form.Item
          label={formatMessage(messages.description)}
          name="description"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(messages.description),
              }),
            },
          ]}
        >
          <Input placeholder={formatMessage(messages.descriptionPlaceholder)} />
        </Form.Item>
        <Form.Item label={formatMessage(messages.increasePoints)} name="points">
          <InputNumber
            formatter={value => (parseInt(`${value}`) >= 0 ? `+${value}` : `${value}`)}
            parser={value => value?.replace(/\D/g, '') || ''}
          />
        </Form.Item>
        <Form.Item label={formatMessage(messages.availableDateRange)}>
          <Input.Group compact>
            <Form.Item name="startedAt">
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                placeholder={formatMessage(commonMessages.term.startedAt)}
                showTime={{ format: 'HH:mm' }}
              />
            </Form.Item>
            <Form.Item name="endedAt">
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                placeholder={formatMessage(commonMessages.term.endedAt)}
                showTime={{ format: 'HH:mm' }}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item label={formatMessage(messages.noteForAdmins)} name="note">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const useSendPoints = () => {
  const [insertPointLogCollection] = useMutation<
    types.INSERT_POINT_LOG_COLLECTION,
    types.INSERT_POINT_LOG_COLLECTIONVariables
  >(gql`
    mutation INSERT_POINT_LOG_COLLECTION($data: [point_log_insert_input!]!) {
      insert_point_log(objects: $data) {
        affected_rows
      }
    }
  `)

  return (value: {
    memberIds: string[]
    description: string
    points: number
    startedAt: Date | null
    endedAt: Date | null
    note: string
  }) =>
    insertPointLogCollection({
      variables: {
        data: value.memberIds.map(memberId => ({
          member_id: memberId,
          description: value.description,
          point: value.points,
          started_at: value.startedAt && moment(value.startedAt).startOf('minute').toDate(),
          ended_at: value.endedAt && moment(value.endedAt).startOf('minute').toDate(),
          note: value.note,
        })),
      },
    })
}

export default PointSendingModal
