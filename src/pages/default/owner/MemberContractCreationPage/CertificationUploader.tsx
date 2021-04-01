import { UploadOutlined } from '@ant-design/icons'
import { Button, Upload } from 'antd'
import { useState } from 'react'
import { useApp } from '../../../../contexts/AppContext'
import { useAuth } from '../../../../contexts/AuthContext'
import { handleError, uploadFile } from '../../../../helpers'

const CertificationUploader: React.VFC<{
  memberId: string
  identity: 'normal' | 'student'
  onCertificationPathSet?: (path: string) => void
}> = ({ memberId, identity, onCertificationPathSet }) => {
  const { id: appId } = useApp()
  const { authToken, apiHost } = useAuth()

  const [uploading, setUploading] = useState(false)

  return (
    <Upload
      showUploadList={false}
      customRequest={({ file }) => {
        setUploading(true)
        uploadFile(`certification/${appId}/student_${memberId}`, file, authToken, apiHost)
          .then(() => onCertificationPathSet?.(file.name))
          .catch(handleError)
          .finally(() => setUploading(false))
      }}
      className={identity === 'normal' ? 'd-none' : undefined}
    >
      <Button icon={<UploadOutlined />} loading={uploading}>
        上傳證明
      </Button>
    </Upload>
  )
}

export default CertificationUploader
