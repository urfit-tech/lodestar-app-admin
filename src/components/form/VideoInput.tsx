import { Input } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { programMessages } from '../../helpers/translation'
import { ClassType } from '../../types/general'
import SingleUploader from './SingleUploader'

const StyleInputGroup = styled(Input.Group)`
  display: flex !important;
  .ant-input {
    width: calc(100% - 120px);
  }
  .ant-btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`

const VideoInput: React.FC<{
  appId: string
  productId: string
  productType: ClassType
  value?: string | null
  onChange?: (value: string | null) => void
}> = ({ value, onChange, appId, productId, productType }) => {
  const { formatMessage } = useIntl()
  const [file, setFile] = useState<UploadFile | undefined>(undefined)
  const uploadTime = Date.now()

  return (
    <StyleInputGroup compact>
      <Input
        className="mr-2"
        value={value || ''}
        placeholder={formatMessage(programMessages.text.videoPlaceholder)}
        onChange={e => {
          onChange && onChange(e.target.value)
        }}
      />

      <SingleUploader
        value={file}
        accept="video/*"
        uploadText={formatMessage(programMessages.text.uploadVideo)}
        path={`${productType}_covers/${appId}/${productId}_video_${uploadTime}`}
        showUploadList={false}
        isPublic
        onChange={(value: any) => setFile(value as UploadFile)}
        onSuccess={() =>
          onChange &&
          onChange(
            `https://${process.env.REACT_APP_S3_BUCKET}/${productType}_covers/${appId}/${productId}_video_${uploadTime}`,
          )
        }
      />
    </StyleInputGroup>
  )
}

export default VideoInput
