import { UploadOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, message, Upload } from 'antd'
import { CardProps } from 'antd/lib/card'
import { RcFile } from 'antd/lib/upload/interface'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { extname } from 'path'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminCard from '../../components/admin/AdminCard'
import * as hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages } from '../../helpers/translation'

type AppBasicAdminCardProps = CardProps
const AppBasicAdminCard: React.VFC<AppBasicAdminCardProps> = ({ ...cardProps }) => {
  const { id: appId, settings, refetch } = useApp()
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<RcFile[]>([])
  const [updateLogo] = useMutation<hasura.UPDATE_LOGO, hasura.UPDATE_LOGOVariables>(UPDATE_LOGO)
  const handleUpload = () => {
    const file = fileList.pop()
    if (!file) {
      message.error('no file')
      return
    }
    setUploading(true)
    const timestamp = Date.now()
    const key = `images/${appId}/logo_${timestamp}${extname(file.name)}`
    const logoUrl = `https://${process.env.REACT_APP_S3_BUCKET}/${key}/240?v=${timestamp}`
    uploadFile(key, file, authToken)
      .then(() =>
        updateLogo({
          variables: { appId, logoUrl },
        }),
      )
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .then(() => refetch?.())
      .catch(handleError)
      .finally(() => setUploading(false))
  }
  return (
    <AdminCard {...cardProps} title="Logo">
      <div className="d-flex">
        <div className="mr-3">
          <Upload
            accept="image/*"
            onRemove={() => setFileList([])}
            beforeUpload={file => {
              setFileList([file])
              return false
            }}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? 'Uploading' : 'Start Upload'}
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 320 }}>
          <img src={settings['logo']} alt="logo" style={{ width: '100%' }} />
        </div>
      </div>
    </AdminCard>
  )
}

const UPDATE_LOGO = gql`
  mutation UPDATE_LOGO($appId: String!, $logoUrl: String!) {
    insert_app_setting(
      objects: [{ app_id: $appId, key: "logo", value: $logoUrl }]
      on_conflict: { constraint: app_setting_app_id_key_key, update_columns: [value] }
    ) {
      affected_rows
    }
  }
`

export default AppBasicAdminCard
