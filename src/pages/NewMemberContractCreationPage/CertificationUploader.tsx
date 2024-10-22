import { UploadOutlined } from '@ant-design/icons'
import { Button, Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload/Upload'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError, uploadFile } from '../../helpers'
import pageMessages from '../translation'

const CertificationUploader: React.VFC<
  UploadProps & {
    memberId: string
    onFinish?: (path: string) => void
  }
> = ({ memberId, onFinish, ...uploadProps }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const [uploading, setUploading] = useState(false)

  return (
    <Upload
      showUploadList={false}
      customRequest={({ file }) => {
        setUploading(true)
        uploadFile(`certification/${appId}/student_${memberId}`, file, authToken)
          .then(() => onFinish?.(file.name))
          .catch(handleError)
          .finally(() => setUploading(false))
      }}
      {...uploadProps}
    >
      <Button icon={<UploadOutlined />} loading={uploading}>
        {formatMessage(pageMessages.CertificationUploader.uploadProof)}
      </Button>
    </Upload>
  )
}

export default CertificationUploader
