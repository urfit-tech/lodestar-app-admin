import { useNode } from '@craftjs/core'
import { Collapse } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { CraftBoxModelProps, CraftImageProps } from 'lodestar-app-element/src/types/craft'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError, uploadFile } from '../../helpers/index'
import { craftPageMessages } from '../../helpers/translation'
import ImageUploader from '../common/ImageUploader'
import BoxModelInput, { formatBoxModelValue } from './BoxModelInput'
import { AdminHeaderTitle, StyledCollapsePanel } from './styled'

type FieldProps = {
  desktopMargin: string
  desktopPadding: string
  desktopCoverUrl?: string
  mobileMargin: string
  mobilePadding: string
  mobileCoverUrl?: string
}

const ImageSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as {
      desktop?: CraftImageProps & CraftBoxModelProps
      mobile?: CraftImageProps & CraftBoxModelProps
    },
  }))

  const [loading, setLoading] = useState(false)
  const [desktopCoverImage, setDesktopCoverImage] = useState<File | null>(null)
  const [mobileCoverImage, setMobileCoverImage] = useState<File | null>(null)

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const desktopMargin = formatBoxModelValue(values.desktopMargin)
        const desktopPadding = formatBoxModelValue(values.desktopPadding)
        const mobileMargin = formatBoxModelValue(values.mobileMargin)
        const mobilePadding = formatBoxModelValue(values.mobilePadding)

        setProp(props => {
          props.desktop.margin = {
            mt: desktopMargin?.[0] || '0',
            mr: desktopMargin?.[1] || '0',
            mb: desktopMargin?.[2] || '0',
            ml: desktopMargin?.[3] || '0',
          }
          props.desktop.padding = {
            pt: desktopPadding?.[0] || '0',
            pr: desktopPadding?.[1] || '0',
            pb: desktopPadding?.[2] || '0',
            pl: desktopPadding?.[3] || '0',
          }
          props.mobile.margin = {
            mt: mobileMargin?.[0] || '0',
            mr: mobileMargin?.[1] || '0',
            mb: mobileMargin?.[2] || '0',
            ml: mobileMargin?.[3] || '0',
          }
          props.mobile.padding = {
            pt: mobilePadding?.[0] || '0',
            pr: mobilePadding?.[1] || '0',
            pb: mobilePadding?.[2] || '0',
            pl: mobilePadding?.[3] || '0',
          }
        })
      })
      .catch(() => {})
  }

  const handleImageUpload: (responsiveType: 'mobile' | 'desktop', file?: File) => void = (responsiveType, file) => {
    if (file) {
      const imageSetConvert = { desktop: setDesktopCoverImage, mobile: setMobileCoverImage }
      setLoading(true)
      const uniqImageId = uuid()
      uploadFile(`images/${appId}/craft/${uniqImageId}`, file, authToken)
        .then(() => {
          imageSetConvert[responsiveType](file)
          setProp(props => {
            props[
              responsiveType
            ].coverUrl = `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${uniqImageId}`
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
      initialValues={{
        desktopCoverImage: props.desktop?.coverUrl,
        desktopMargin: `${props.desktop?.margin?.mt || 0};${props.desktop?.margin?.mr || 0};${
          props.desktop?.margin?.mb || 0
        };${props.desktop?.margin?.ml || 0}`,
        desktopPadding: `${props.desktop?.padding?.pt || 0};${props.desktop?.padding?.pr || 0};${
          props.desktop?.padding?.pb || 0
        };${props.desktop?.padding?.pl || 0}`,
        mobileCoverImage: props.mobile?.coverUrl,
        mobileMargin: `${props.mobile?.margin?.mt || 0};${props.mobile?.margin?.mr || 0};${
          props.mobile?.margin?.mb || 0
        };${props.mobile?.margin?.ml || 0}`,
        mobilePadding: `${props.mobile?.padding?.pt || 0};${props.mobile?.padding?.pr || 0};${
          props.mobile?.padding?.pb || 0
        };${props.mobile?.padding?.pl || 0}`,
      }}
      onChange={handleChange}
    >
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['desktopDisplay']}
      >
        <StyledCollapsePanel
          key="desktopDisplay"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.desktopDisplay)}</AdminHeaderTitle>}
        >
          <Form.Item name="desktopCoverImage">
            <ImageUploader
              uploading={loading}
              file={desktopCoverImage}
              initialCoverUrl={props.desktop?.coverUrl}
              onChange={file => handleImageUpload('desktop', file)}
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
        </StyledCollapsePanel>
      </Collapse>
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['mobileDisplay']}
      >
        <StyledCollapsePanel
          key="mobileDisplay"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.mobileDisplay)}</AdminHeaderTitle>}
        >
          <Form.Item name="mobileCoverImage">
            <ImageUploader
              uploading={loading}
              file={mobileCoverImage}
              initialCoverUrl={props.mobile?.coverUrl}
              onChange={file => handleImageUpload('mobile', file)}
            />
          </Form.Item>
          <Form.Item
            name="mobileMargin"
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
            name="mobilePadding"
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
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ImageSettings
