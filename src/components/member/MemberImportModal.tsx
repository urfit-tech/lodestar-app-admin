import { ImportOutlined } from '@ant-design/icons'
import { Alert, Button, Form, message, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { uploadFileV2 } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const MemberImportModal: React.FC<{
  onRefetch?: () => void
}> = ({ onRefetch }) => {
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [responseList, setResponseList] = useState<
    {
      status: number
      statusText: string
      data: string | null
      name: string | null
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
            customRequest={({ file, onSuccess, onProgress, onError }) => {
              uploadFileV2(
                `members_import_${dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ssZ[Z]')}`,
                file,
                authToken,
                appId,
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
        </Form.Item>
      </Form>
      {responseList.map(response => {
        switch (response.status) {
          case 201:
            return (
              <Alert
                message={`${response.name}上傳成功!`}
                type="success"
                description={
                  <div>
                    <div>匯入結果將會以信件寄出</div>
                  </div>
                }
              />
            )
          default:
            return <Alert message={`${response.name}上傳失敗!`} type="error" />
        }
      })}
    </AdminModal>
  )
}

export default MemberImportModal
