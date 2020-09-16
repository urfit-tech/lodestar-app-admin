import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import Icon, { LoadingOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import AppContext from '../../contexts/AppContext'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as MoreIcon } from '../../images/icon/more.svg'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { MerchandiseProps } from '../../types/merchandise'
import SingleUploader from '../admin/SingleUploader'
import { CustomRatioImage } from '../common/Image'

const StyledOverlayBlock = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  padding: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  line-height: normal;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;
`
const StyledImageWrapper = styled.div<{ src?: string }>`
  position: relative;
  width: 120px;
  height: 120px;
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  &:hover ${StyledOverlayBlock} {
    opacity: 1;
  }
`
const StyledMeta = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 14px;
  line-height: 1;
  letter-spacing: 0.8px;
`
const StyledUploader = styled(SingleUploader)`
  && {
    width: 120px;
    height: 120px;
    margin-right: 1rem;
    margin-bottom: 1rem;

    > .ant-upload {
      margin: 0;
      width: 100%;
      height: 100%;
      border: dashed 2px var(--gray);
      background: var(--gray-lighter);
    }
    .ant-btn {
      font-size: 24px;
    }
  }
`
const StyledButtonText = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`

type MerchandiseImagesUploaderProps = FormComponentProps & {
  merchandiseId: string
  images: MerchandiseProps['images']
  onChange?: (images: MerchandiseProps['images']) => void
}
const MerchandiseImagesUploader: React.FC<MerchandiseImagesUploaderProps> = ({
  form,
  merchandiseId,
  images,
  onChange,
}) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const [fieldId, setFieldId] = useState(uuid())

  const handleSuccess = () => {
    onChange &&
      onChange([
        ...images,
        {
          url: `https://${process.env.REACT_APP_S3_BUCKET}/merchandise_images/${app.id}/${merchandiseId}/${fieldId}`,
          isCover: images.length === 0,
        },
      ])

    setFieldId(uuid())
  }

  const handleSetCover = (target: number) => {
    onChange &&
      onChange(
        images.map((image, index) => ({
          url: image.url,
          isCover: index === target,
        })),
      )
  }
  const handleDelete = (target: number) => {
    onChange && onChange(images.filter((image, index) => index !== target))
  }

  return (
    <div className="d-flex align-items-center justify-content-start flex-wrap">
      {images.map((image, index) => (
        <StyledImageWrapper key={image.url} className="mr-3 mb-3">
          <CustomRatioImage width="100%" ratio={1} src={image.url} />
          {image.isCover && (
            <StyledMeta className="py-2 text-center">{formatMessage(merchandiseMessages.label.cover)}</StyledMeta>
          )}
          <StyledOverlayBlock>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item className="cursor-pointer" onClick={() => handleSetCover(index)}>
                    {formatMessage(merchandiseMessages.ui.setCover)}
                  </Menu.Item>
                  <Menu.Item className="cursor-pointer" onClick={() => handleDelete(index)}>
                    {formatMessage(merchandiseMessages.ui.deleteImage)}
                  </Menu.Item>
                </Menu>
              }
            >
              <Icon component={() => <MoreIcon />} />
            </Dropdown>
          </StyledOverlayBlock>
        </StyledImageWrapper>
      ))}

      {form.getFieldDecorator('image')(
        <StyledUploader
          accept="image/*"
          listType="picture-card"
          showUploadList={false}
          path={`merchandise_images/${app.id}/${merchandiseId}/${fieldId}`}
          isPublic
          onSuccess={() => handleSuccess()}
          trigger={({ loading }) => (
            <Button type="link" disabled={loading}>
              {loading ? (
                <>
                  <LoadingOutlined />
                  <StyledButtonText>{formatMessage(commonMessages.label.uploading)}</StyledButtonText>
                </>
              ) : (
                <Icon component={() => <PlusIcon />} />
              )}
            </Button>
          )}
        />,
      )}
    </div>
  )
}

export default Form.create<MerchandiseImagesUploaderProps>()(MerchandiseImagesUploader)
