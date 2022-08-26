import { ImportOutlined } from '@ant-design/icons'
import { Alert, Button, Form, message, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const MemberImportModal: React.FC<{
  onRefetch?: () => void
}> = ({ onRefetch }) => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [responseList, setResponseList] = useState<
    {
      code: string
      message: string
      result: {
        totalLeads: number
        existedLeads: number
        mergedLeads: number
        newLeads: number
      } | null
    }[]
  >([])

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<ImportOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.import)}
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
            name="memberList"
            method="POST"
            action={`${process.env.REACT_APP_API_BASE_ROOT}/sys/import-leads`}
            headers={{ authorization: `Bearer ${authToken}` }}
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
            <Button icon={<ImportOutlined />}>{formatMessage(commonMessages.ui.upload)}</Button>
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
                    <div>Total: {response.result?.totalLeads}</div>
                    <div>Existed: {response.result?.existedLeads}</div>
                    <div>Merged: {response.result?.mergedLeads}</div>
                    <div>New: {response.result?.newLeads}</div>
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

export default MemberImportModal
