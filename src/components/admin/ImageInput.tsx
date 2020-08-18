import { UploadFile } from 'antd/lib/upload/interface'
import React, { useState } from 'react'
import styled from 'styled-components'
import { CustomRadioImageProps, CustomRatioImage } from '../common/Image'
import SingleUploader from '../common/SingleUploader'

const StyledSingleUploader = styled(SingleUploader)`
  && {
    width: auto;
  }

  .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    height: auto;
    width: 120px;
    border: none;
    background: none;

    .ant-upload {
      padding: 0;
    }
  }
`

const ImageInput: React.FC<{
  path: string
  value?: string | null
  onChange?: (value: string | null) => void
  image: CustomRadioImageProps
}> = ({ path, value, onChange, image }) => {
  const [file, setFile] = useState<UploadFile | undefined>(undefined)

  return (
    <div className="d-flex align-items-center justify-content-start">
      {value && <CustomRatioImage {...image} src={value} className="mr-5" />}

      <StyledSingleUploader
        value={file}
        onChange={(value: any) => setFile(value as UploadFile)}
        accept="image/*"
        listType="picture-card"
        showUploadList={false}
        path={path}
        onSuccess={() => onChange && onChange(path)}
      />
    </div>
  )
}

export default ImageInput
