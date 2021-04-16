import { UploadOutlined } from '@ant-design/icons'
import { Button, Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload/Upload'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { handleError, uploadFile } from 'lodestar-app-admin/src/helpers'
import { useState } from 'react'

const CertificationUploader: React.VFC<
  UploadProps & {
    memberId: string
    onFinish?: (path: string) => void
  }
> = ({ memberId, onFinish, ...uploadProps }) => {
  const { id: appId } = useApp()
  const { authToken, apiHost } = useAuth()

  const [uploading, setUploading] = useState(false)

  return (
    <Upload
      showUploadList={false}
      customRequest={({ file }) => {
        setUploading(true)
        uploadFile(`certification/${appId}/student_${memberId}`, file, authToken, apiHost)
          .then(() => onFinish?.(file.name))
          .catch(handleError)
          .finally(() => setUploading(false))
      }}
      {...uploadProps}
    >
      <Button icon={<UploadOutlined />} loading={uploading}>
        上傳證明
      </Button>
    </Upload>
  )
}

export default CertificationUploader
