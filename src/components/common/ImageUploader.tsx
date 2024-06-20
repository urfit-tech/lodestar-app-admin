import { UploadOutlined } from '@ant-design/icons'
import { Button, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import FileUploader from './FileUploader'
import { CustomRatioImage } from './Image'

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

const ImageUploader: React.FC<{
  file: File | null
  initialCoverUrl?: string | null
  uploading?: boolean
  onChange?: (file: File) => void
}> = ({ file, initialCoverUrl, uploading, onChange }) => {
  const { formatMessage } = useIntl()
  const [imgSrc, setImgSrc] = useState<string | null>(initialCoverUrl || null)

  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const dataUrl = reader.result as string | null
        setImgSrc(dataUrl)
      }
    }
  }, [file])

  return (
    <StyledWrapper>
      <CustomRatioImage width="224px" ratio={9 / 16} src={imgSrc || EmptyCover} shape="rounded" />
      <StyledMask className="d-flex justify-content-center align-items-center">
        <FileUploader
          renderTrigger={({ onClick }) => (
            <StyledButton icon={<UploadOutlined />} onClick={onClick}>
              {formatMessage(commonMessages.ui.uploadImage)}
            </StyledButton>
          )}
          accept="image/*"
          onChange={([file]) => onChange?.(file)}
          fileList={file ? [file] : []}
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

export default ImageUploader
