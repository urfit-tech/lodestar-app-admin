import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMemberSummaryCollection } from '../../hooks/member'
import types from '../../types'
import AdminModal from '../admin/AdminModal'
import MemberSelector from '../form/MemberSelector'

const messages = defineMessages({
  sendingCoin: { id: 'promotion.label.sendingCoin', defaultMessage: '發送代幣' },
  sendCoin: { id: 'promotion.ui.sendCoin', defaultMessage: '發送代幣' },
  selectMember: { id: 'promotion.label.selectMember', defaultMessage: '選擇會員' },
  title: { id: 'promotion.label.title', defaultMessage: '項目' },
  description: { id: 'promotion.label.description', defaultMessage: '項目描述' },
  increaseCoins: { id: 'promotion.label.increaseCoins', defaultMessage: '增加代幣' },
  availableDateRange: { id: 'promotion.label.availableDateRange', defaultMessage: '有效期限' },
  noteForAdmins: { id: 'promotion.label.noteForAdmins', defaultMessage: '備註(僅供管理員檢視)' },
  titlePlaceholder: { id: 'promotion.text.titlePlaceholder', defaultMessage: '請填寫項目名稱' },
  descriptionPlaceholder: { id: 'promotion.text.descriptionPlaceholder', defaultMessage: '請填寫項目描述' },
})

type FieldProps = {
  memberIds: string[]
  title: string
  description: string
  amount: number
  startedAt: Moment | null
  endedAt: Moment | null
  note: string
}

const CoinSendingModal: React.FC<{
  onRefetch?: () => Promise<any>
}> = ({ onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { members } = useMemberSummaryCollection()
  const [insertCoinLogCollection] = useMutation<
    types.INSERT_COIN_LOG_COLLECTION,
    types.INSERT_COIN_LOG_COLLECTIONVariables
  >(INSERT_COIN_LOG_COLLECTION)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        insertCoinLogCollection({
          variables: {
            data: values.memberIds.map(memberId => ({
              member_id: memberId,
              title: values.title,
              description: values.description,
              amount: values.amount,
              started_at: values.startedAt && moment(values.startedAt).startOf('minute').toDate(),
              ended_at: values.endedAt && moment(values.endedAt).startOf('minute').toDate(),
              note: values.note,
            })),
          },
        })
          .then(() =>
            onRefetch?.().then(() => {
              onSuccess()
              form.resetFields()
            }),
          )
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(messages.sendingCoin)}
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(messages.sendCoin)}
        </Button>
      )}
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
    >
      <Form form={form} layout="vertical" colon={false} hideRequiredMark initialValues={{ description: '', amount: 1 }}>
        <Form.Item
          label={formatMessage(messages.selectMember)}
          name="memberIds"
          rules={[{ required: true, message: formatMessage(errorMessages.form.memberIdIsRequired) }]}
        >
          <MemberSelector mode="multiple" members={members} />
        </Form.Item>
        <Form.Item
          label={formatMessage(messages.title)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(messages.title),
              }),
            },
          ]}
        >
          <Input placeholder={formatMessage(messages.titlePlaceholder)} />
        </Form.Item>
        <Form.Item
          className="d-none"
          label={formatMessage(messages.description)}
          name="description"
          rules={[
            {
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(messages.description),
              }),
            },
          ]}
        >
          <Input placeholder={formatMessage(messages.descriptionPlaceholder)} />
        </Form.Item>
        <Form.Item label={formatMessage(messages.increaseCoins)} name="amount">
          <InputNumber
            min={1}
            formatter={value => (parseInt(`${value}`) >= 0 ? `+${value}` : `${value}`)}
            parser={value => value?.replace(/\D/g, '') || ''}
          />
        </Form.Item>
        <Form.Item label={formatMessage(messages.availableDateRange)}>
          <Input.Group compact>
            <Form.Item name="startedAt">
              <DatePicker format="YYYY-MM-DD" placeholder={formatMessage(commonMessages.term.startedAt)} />
            </Form.Item>
            <Form.Item name="endedAt">
              <DatePicker format="YYYY-MM-DD" placeholder={formatMessage(commonMessages.term.endedAt)} />
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

const INSERT_COIN_LOG_COLLECTION = gql`
  mutation INSERT_COIN_LOG_COLLECTION($data: [coin_log_insert_input!]!) {
    insert_coin_log(objects: $data) {
      affected_rows
    }
  }
`

export default CoinSendingModal
