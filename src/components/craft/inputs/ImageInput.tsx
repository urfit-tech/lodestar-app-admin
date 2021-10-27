import { UploadOutlined } from '@ant-design/icons'
import { Button, Spin } from 'antd'
import { CustomRatioImage } from 'lodestar-app-element/src/components/common/Image'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError, uploadFile } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { commonMessages } from '../../../helpers/translation'
import EmptyCover from '../../../images/default/empty-cover.png'
import FileUploader from '../../common/FileUploader'

const StyledButton = styled(Button)`
  && {
    border-color: white;
    color: white;
    background: transparent;

    &:hover {
      border-color: var(--gray);
      color: var(--gray);
    }
  }
`

const StyledWrapper = styled.div`
  position: relative;
  width: 224px;
`
const StyledMask = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 4px;
  transition: all 0.6s;
  z-index: 1;
  opacity: 0;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.7);
  }
`
const StyledSpinBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 4px;
  z-index: 2;
  transition: all 0.6s;
  background: rgba(0, 0, 0, 0.7);
`

type ImageInputProps = {
  value?: string
  onChange?: (value: string) => void
}
const ImageInput: React.FC<ImageInputProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleFilesChange = (files: File[]) => {
    const file = files[0]
    if (file) {
      setUploading(true)
      const imageId = v4()
      uploadFile(`images/${appId}/craft/${imageId}`, file, authToken)
        .then(() => {
          console.log(`https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${imageId}`)
          onChange?.(`https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${imageId}`)
        })
        .catch(handleError)
        .finally(() => setUploading(false))
    }
    setFiles(files)
  }
  return (
    <StyledWrapper>
      <CustomRatioImage width="224px" ratio={9 / 16} src={value || EmptyCover} shape="rounded" />
      <StyledMask className="d-flex justify-content-center align-items-center">
        <FileUploader
          renderTrigger={({ onClick }) => (
            <StyledButton icon={<UploadOutlined />} onClick={onClick}>
              {formatMessage(commonMessages.ui.uploadImage)}
            </StyledButton>
          )}
          accept="image/*"
          onChange={files => handleFilesChange(files)}
          fileList={files}
        />
      </StyledMask>
      {uploading && (
        <StyledSpinBlock>
          <Spin />
        </StyledSpinBlock>
      )}
    </StyledWrapper>
  )
}

export default ImageInput
