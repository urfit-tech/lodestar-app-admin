import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { v4 as uuid } from 'uuid'
import { handleError, uploadFile } from '../../../helpers/index'
import { craftPageMessages } from '../../../helpers/translation'
import ImageUploader from '../../common/ImageUploader'
import BoxModelInput from '../inputs/BoxModelInput'
import { CraftSettings } from './CraftSettings'

type FieldProps = {
  url: string
  spaceStyle: CSSObject
}

const ImageSettings: CraftSettings<ImageProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          src: values.url,
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
          },
        })
      })
      .catch(() => {})
  }

  const handleImageUpload = (file?: File) => {
    if (file) {
      setLoading(true)
      const uniqImageId = uuid()
      uploadFile(`images/${appId}/craft/${uniqImageId}`, file, authToken)
        .then(() => {
          onPropsChange?.({
            src: `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${uniqImageId}`,
          })
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={props}
      onChange={handleChange}
    >
      <Form.Item name="imageFile">
        <ImageUploader
          uploading={loading}
          file={imageFile}
          initialCoverUrl={props.src}
          onChange={file => handleImageUpload(file)}
        />
      </Form.Item>
      <Form.Item
        name="desktopMargin"
        label={formatMessage(craftPageMessages.label.margin)}
        rules={[
          {
            required: true,
            pattern: /^\d+;\d+;\d+;\d+$/,
            message: formatMessage(craftPageMessages.text.boxModelInputWarning),
          },
        ]}
      >
        <BoxModelInput onChange={handleChange} />
      </Form.Item>
      <Form.Item
        name="desktopPadding"
        label={formatMessage(craftPageMessages.label.padding)}
        rules={[
          {
            required: true,
            pattern: /^\d+;\d+;\d+;\d+$/,
            message: formatMessage(craftPageMessages.text.boxModelInputWarning),
          },
        ]}
      >
        <BoxModelInput onChange={handleChange} />
      </Form.Item>
    </Form>
  )
}

export default ImageSettings
