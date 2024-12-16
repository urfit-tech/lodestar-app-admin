import { FileAddOutlined, ImportOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Box } from '@chakra-ui/react'
import { Alert, Button, DatePicker, Dropdown, Form, Input, InputNumber, Menu, message, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import * as XLSX from 'xlsx'
import hasura from '../../hasura'
import { handleError, uploadFileV2 } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMemberSummaryCollection } from '../../hooks/member'
import AdminModal from '../admin/AdminModal'
import MemberSelector from '../form/MemberSelector'

const messages = defineMessages({
  sendingCoin: { id: 'promotion.label.sendingCoin', defaultMessage: '發送代幣' },
  sendCoin: { id: 'promotion.ui.sendCoin', defaultMessage: '發送代幣' },
  selectMember: { id: 'promotion.label.selectMember', defaultMessage: '選擇會員' },
  batchSendCoin: { id: 'promotion.label.batchSendCoin', defaultMessage: 'Batch Send Coin' },
  manualSendCoin: { id: 'promotion.label.manualSendCoin', defaultMessage: 'Manual Send Coin' },
  downloadSampleCsv: { id: 'promotion.label.downloadSampleCsv', defaultMessage: 'Download Sample Csv' },
  uploadMember: { id: 'promotion.label.uploadMember', defaultMessage: '上傳名單' },
  title: { id: 'promotion.label.title', defaultMessage: '項目' },
  scheme: { id: 'promotion.label.scheme', defaultMessage: '格式' },
  description: { id: 'promotion.label.description', defaultMessage: '項目描述' },
  increaseCoins: { id: 'promotion.label.increaseCoins', defaultMessage: '增加代幣' },
  availableDateRange: { id: 'promotion.label.availableDateRange', defaultMessage: '有效期限' },
  noteForAdmins: { id: 'promotion.label.noteForAdmins', defaultMessage: '備註(僅供管理員檢視)' },
  titlePlaceholder: { id: 'promotion.text.titlePlaceholder', defaultMessage: '請填寫項目名稱' },
  descriptionPlaceholder: { id: 'promotion.text.descriptionPlaceholder', defaultMessage: '請填寫項目描述' },
  uploadSuccess: {
    id: 'member.MemberImportModal.uploadSuccess',
    defaultMessage: '{name} 上傳成功!',
  },
  uploadFail: {
    id: 'member.MemberImportModal.uploadFail',
    defaultMessage: '{name} 上傳失敗!',
  },
  importResultNotification: {
    id: 'member.MemberImportModal.importResultNotification',
    defaultMessage: '匯入結果將會以信件寄出',
  },
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

const downloadSampleCsv = () => {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    [
      '信箱',
      '項目',
      '代幣數量',
      '代幣開始時間',
      '代幣結束時間',
      '備註',
      '描述',
      '領取時間',
      '領取開始時間',
      '領取結束時間',
      '建立時間',
    ],
    [
      'email',
      'title',
      'amount',
      'startedAt',
      'endedAt',
      'note',
      'description',
      'claimedAt',
      'claimStartedAt',
      'claimEndedAt',
      'createdAt',
    ],
    ['member1@sample.com', '範例-A', '100', '', '', '', '', '2024-11-12 10:00:00', '', '', ''],
    ['member2@sample.com', '範例-B', '-0.2', '2024-11-12 10:00:00', '', '', '', '2024-11-12 10:00:00', '', '', ''],
  ])
  XLSX.utils.book_append_sheet(workbook, worksheet)
  XLSX.writeFile(workbook, 'sample_coins.csv')
}

const CoinSendingModal: React.FC<{
  onRefetch?: () => Promise<any>
}> = ({ onRefetch }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const { members } = useMemberSummaryCollection()
  const [insertCoinLogCollection] = useMutation<
    hasura.INSERT_COIN_LOG_COLLECTION,
    hasura.INSERT_COIN_LOG_COLLECTIONVariables
  >(INSERT_COIN_LOG_COLLECTION)
  const [loading, setLoading] = useState(false)
  const [responseList, setResponseList] = useState<
    {
      status: number
      statusText: string
      data: string | null
      name: string | null
    }[]
  >([])
  const [modelDisplayType, setModalDisplayType] = useState<'manual' | 'batch' | null>()

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
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                onClick={() => {
                  setVisible(true)
                  setModalDisplayType('manual')
                }}
              >
                {formatMessage(messages.manualSendCoin)}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  setVisible(true)
                  setModalDisplayType('batch')
                }}
              >
                {formatMessage(messages.batchSendCoin)}
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="primary" icon={<FileAddOutlined />}>
            {formatMessage(messages.sendCoin)}
          </Button>
        </Dropdown>
      )}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          {modelDisplayType !== 'batch' && (
            <>
              <Button className="mr-2" onClick={() => setVisible(false)}>
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
                {formatMessage(commonMessages.ui.confirm)}
              </Button>
            </>
          )}
        </>
      )}
    >
      {modelDisplayType === 'manual' && (
        <Form
          form={form}
          layout="vertical"
          colon={false}
          hideRequiredMark
          initialValues={{ description: '', amount: 1 }}
        >
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
            name="memberIds"
            rules={[{ required: true, message: formatMessage(errorMessages.form.memberIdIsRequired) }]}
            label={formatMessage(messages.selectMember)}
          >
            <MemberSelector mode="multiple" members={members} maxTagCount={1000} />
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
            <InputNumber formatter={value => (Number(`${value}`) > 0 ? `+${value}` : `${value}`)} />
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
      )}
      {modelDisplayType === 'batch' && (
        <>
          <div>
            <Button style={{ padding: 0 }} type="link" onClick={() => downloadSampleCsv()}>
              {formatMessage(messages.downloadSampleCsv)}
            </Button>
          </div>
          <Upload
            multiple
            customRequest={async ({ file, onSuccess, onProgress, onError }) => {
              const key = `coinImport/coin_import_${dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ssZ[Z]')}`
              const s3UploadRes = await uploadFileV2(key, file, 'import', authToken, appId)
              const eTag = s3UploadRes.headers.etag.replaceAll('"', '')
              await axios
                .post(
                  `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/coins/import`,
                  {
                    appId,
                    fileInfos: [{ key, checksum: eTag }],
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${authToken}`,
                    },
                  },
                )
                .then(res => onSuccess(res, file))
                .catch(error => onError(error))
            }}
            accept=".csv,.xlsx,.xls"
            onChange={info => {
              if (info.file.status === 'done') {
                const response = info.file.response
                response.name = info.file.name
                setResponseList(state => [...state, response])
                onRefetch?.()
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`)
              }
            }}
          >
            <Button icon={<ImportOutlined />}>{formatMessage(commonMessages.ui.upload)}</Button>
          </Upload>
          <Box marginTop="10px">
            {responseList.map(response => {
              switch (response.status) {
                case 201:
                  return (
                    <Alert
                      message={formatMessage(messages.uploadSuccess, { name: response.name })}
                      type="success"
                      description={
                        <div>
                          <div>{formatMessage(messages.importResultNotification)}</div>
                        </div>
                      }
                    />
                  )
                default:
                  return <Alert message={formatMessage(messages.uploadFail, { name: response.name })} type="error" />
              }
            })}
          </Box>
        </>
      )}
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
