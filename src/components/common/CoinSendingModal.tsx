import { FileAddOutlined, UploadOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, DatePicker, Form, Input, InputNumber, message, Radio, Space, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMemberSummaryCollection } from '../../hooks/member'
import AdminModal from '../admin/AdminModal'
import MemberSelector from '../form/MemberSelector'

const messages = defineMessages({
  sendingCoin: { id: 'promotion.label.sendingCoin', defaultMessage: '發送代幣' },
  sendCoin: { id: 'promotion.ui.sendCoin', defaultMessage: '發送代幣' },
  selectMember: { id: 'promotion.label.selectMember', defaultMessage: '選擇會員' },
  bathSelectMember: { id: 'promotion.label.bathSelectMember', defaultMessage: '批次選擇名單' },
  uploadMember: { id: 'promotion.label.uploadMember', defaultMessage: '上傳名單' },
  title: { id: 'promotion.label.title', defaultMessage: '項目' },
  scheme: { id: 'promotion.label.scheme', defaultMessage: '格式' },
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
    hasura.INSERT_COIN_LOG_COLLECTION,
    hasura.INSERT_COIN_LOG_COLLECTIONVariables
  >(INSERT_COIN_LOG_COLLECTION)
  const [loading, setLoading] = useState(false)
  const [memberSelectionMode, setMemberSelectionMode] = useState<'selector' | 'uploader'>('selector')

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
              title: values.title || '',
              description: values.description || '',
              amount: values.amount,
              started_at: values.startedAt && moment(values.startedAt).startOf('minute').toDate(),
              ended_at: values.endedAt && moment(values.endedAt).startOf('minute').toDate(),
              note: values.note || '',
            })),
          },
        })
          .then(() =>
            onRefetch?.().then(() => {
              onSuccess()
              form.resetFields()
              setMemberSelectionMode('selector')
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
        <Radio.Group
          buttonStyle="solid"
          value={memberSelectionMode}
          onChange={e => setMemberSelectionMode(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" className="mb-4" style={{ width: '100%' }}>
            <Radio value="selector">{formatMessage(messages.selectMember)}</Radio>
            {memberSelectionMode === 'selector' && (
              <Form.Item
                name="memberIds"
                rules={[{ required: true, message: formatMessage(errorMessages.form.memberIdIsRequired) }]}
              >
                <MemberSelector mode="multiple" members={members} maxTagCount={1000} />
              </Form.Item>
            )}
            <Space direction="horizontal" align="center">
              <Radio value="uploader">
                {formatMessage(messages.bathSelectMember)} ({formatMessage(messages.scheme)}
                <Button
                  className="p-0"
                  type="link"
                  onClick={() =>
                    (window.location.href = `https://${process.env.REACT_APP_S3_BUCKET}/public/sample_members.csv`)
                  }
                >
                  {formatMessage(commonMessages.label.example)}
                </Button>
                )
              </Radio>
              {memberSelectionMode === 'uploader' && (
                <Form.Item
                  name="memberIds"
                  noStyle
                  rules={[{ required: true, message: formatMessage(errorMessages.form.memberIdIsRequired) }]}
                >
                  <MemberUploader />
                </Form.Item>
              )}
            </Space>
          </Space>
        </Radio.Group>
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
            // min={1}
            formatter={value => (Number(`${value}`) > 0 ? `+${value}` : `${value}`)}
            // parser={value => value?.replace(/\D/g, '') || ''}
          />
        </Form.Item>
        <Form.Item label={formatMessage(messages.availableDateRange)}>
          <Input.Group compact>
            <Form.Item name="startedAt">
              <DatePicker format="YYYY-MM-DD" placeholder={formatMessage(commonMessages.label.startedAt)} />
            </Form.Item>
            <Form.Item name="endedAt">
              <DatePicker format="YYYY-MM-DD" placeholder={formatMessage(commonMessages.label.endedAt)} />
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

const MemberUploader: React.VFC<{
  onChange?: (memberIds: string[]) => void
}> = ({ onChange }) => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  return (
    <Upload
      name="memberList"
      method="POST"
      action={`${process.env.REACT_APP_API_BASE_ROOT}/sys/import-leads`}
      headers={{ authorization: `Bearer ${authToken}` }}
      accept=".csv"
      onChange={info => {
        if (info.file.status === 'done') {
          const response = info.file.response
          Array.isArray(response?.result?.leadIds) && onChange?.(response.result.leadIds)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`)
        }
      }}
    >
      <Button icon={<UploadOutlined />}>{formatMessage(messages.uploadMember)}</Button>
    </Upload>
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
