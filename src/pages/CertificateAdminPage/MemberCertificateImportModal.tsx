import { ImportOutlined } from '@ant-design/icons'
import { Alert, Button, Form, message, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
import pageMessages from '../translation'

const MemberCertificateImportModal: React.FC<{
  certificateId: string
  onRefetch?: () => void
}> = ({ certificateId, onRefetch }) => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [responseList, setResponseList] = useState<
    {
      code: string
      message: string
      result: {
        total: number
        existed: number
        new: number
      } | null
    }[]
  >([])

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<ImportOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(pageMessages['*'].import)}
        </Button>
      )}
      title={null}
      footer={null}
      onCancel={() => setResponseList([])}
    >
      <Form form={form} layout="vertical" colon={false} hideRequiredMark>
        <Form.Item>
          <Upload
            multiple
            name="memberCertificateList"
            method="POST"
            action={`${process.env.REACT_APP_API_BASE_ROOT}/sys/import-member-certificates`}
            headers={{ authorization: `Bearer ${authToken}` }}
            data={{ certificateId: certificateId }}
            accept=".csv"
            onChange={info => {
              if (info.file.status === 'done') {
                const response = info.file.response
                setResponseList(state => [...state, response])
                onRefetch?.()
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`)
              }
            }}
          >
            <Button icon={<ImportOutlined />}>{formatMessage(pageMessages['*'].upload)}</Button>
          </Upload>
        </Form.Item>
      </Form>
      {responseList.map(response => {
        switch (response.code) {
          case 'SUCCESS':
            return (
              <Alert
                message="Import successfully!"
                type="success"
                description={
                  <div>
                    <div>Total: {response.result?.total}</div>
                    <div>Existed: {response.result?.existed}</div>
                    <div>New: {response.result?.new}</div>
                  </div>
                }
              />
            )
          default:
            return <Alert message={response.message} type="error" />
        }
      })}
    </AdminModal>
  )
}

export default MemberCertificateImportModal
