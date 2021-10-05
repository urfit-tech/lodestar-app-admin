import { useNode } from '@craftjs/core'
import { Collapse, Form, Input, Radio, Space } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftCardProps } from 'lodestar-app-element/src/components/craft/CraftCard'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { CraftTextStyleProps } from 'lodestar-app-element/src/types/craft'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { AdminHeaderTitle, StyledCollapsePanel } from '.'
import { handleError, uploadFile } from '../../../helpers'
import { commonMessages, craftPageMessages } from '../../../helpers/translation'
import ImageUploader from '../../common/ImageUploader'
import BoxModelInput, { formatBoxModelValue } from './BoxModelInput'
import ColorPickerBlock from './ColorPickerBlock'
import ParagraphContentBlock from './ParagraphContentBlock'
import TextStyleBlock from './TextStyleBlock'
import TitleContentBlock from './TitleContentBlock'

type FieldProps = Pick<
  CraftCardProps,
  | 'imageType'
  | 'imageUrl'
  | 'imageAlign'
  | 'title'
  | 'paragraph'
  | 'variant'
  | 'outlineColor'
  | 'backgroundType'
  | 'solidColor'
  | 'backgroundImageUrl'
  | 'avatarType'
  | 'avatarImageUrl'
  | 'avatarName'
> & {
  imageMargin?: string
  imagePadding?: string
  titleStyle: Pick<CraftTextStyleProps, 'fontSize' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
  paragraphStyle?: Pick<CraftTextStyleProps, 'fontSize' | 'lineHeight' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
  cardMargin: string
  cardPadding: string
}

const CardSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftCardProps,
    selected: node.events.selected,
  }))

  const [image, setImage] = useState<File | null>(null)
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const imageMargin = formatBoxModelValue(values.imageMargin)
        const imagePadding = formatBoxModelValue(values.imagePadding)
        const cardMargin = formatBoxModelValue(values.cardMargin)
        const cardPadding = formatBoxModelValue(values.cardPadding)
        const titleMargin = formatBoxModelValue(values.titleStyle?.margin)
        const paragraphMargin = formatBoxModelValue(values.paragraphStyle?.margin)

        setProp(props => {
          props.imageType = values.imageType
          props.imageMargin = {
            mt: imageMargin?.[0] || '0',
            mr: imageMargin?.[1] || '0',
            mb: imageMargin?.[2] || '0',
            ml: imageMargin?.[3] || '0',
          }
          props.imagePadding = {
            pt: imagePadding?.[0] || '0',
            pr: imagePadding?.[1] || '0',
            pb: imagePadding?.[2] || '0',
            pl: imagePadding?.[3] || '0',
          }
          props.imageAlign = values.imageAlign
          props.avatarName = values.avatarName
          props.avatarType = values.avatarType
          props.cardMargin = {
            mt: cardMargin?.[0] || '0',
            mr: cardMargin?.[1] || '0',
            mb: cardMargin?.[2] || '0',
            ml: cardMargin?.[3] || '0',
          }
          props.cardPadding = {
            pt: cardPadding?.[0] || '0',
            pr: cardPadding?.[1] || '0',
            pb: cardPadding?.[2] || '0',
            pl: cardPadding?.[3] || '0',
          }
          props.variant = values.variant
          props.backgroundType = values.backgroundType
          props.outlineColor = values.outlineColor
          props.solidColor = values.solidColor
          props.title = values.title
          props.titleStyle.fontSize = values.titleStyle.fontSize
          props.titleStyle.margin = {
            mt: titleMargin?.[0] || '0',
            mr: titleMargin?.[1] || '0',
            mb: titleMargin?.[2] || '0',
            ml: titleMargin?.[3] || '0',
          }
          props.titleStyle.textAlign = values.titleStyle.textAlign
          props.titleStyle.fontWeight = values.titleStyle.fontWeight
          props.titleStyle.color = values.titleStyle.color
          if (props.type !== 'feature' && props.paragraphStyle) {
            props.paragraph = values?.paragraph
            props.paragraphStyle.fontSize = values.paragraphStyle?.fontSize || 0
            props.paragraphStyle.lineHeight = values?.paragraphStyle?.lineHeight || 1
            props.paragraphStyle.margin = {
              mt: paragraphMargin?.[0] || '0',
              mr: paragraphMargin?.[1] || '0',
              mb: paragraphMargin?.[2] || '0',
              ml: paragraphMargin?.[3] || '0',
            }
            props.paragraphStyle.textAlign = values?.paragraphStyle?.textAlign || 'center'
            props.paragraphStyle.fontWeight = values?.paragraphStyle?.fontWeight || 'normal'
            props.paragraphStyle.color = values?.paragraphStyle?.color || '#585858'
          }
        })
      })
      .catch(() => {})
  }
  const handleImageUpload: (type?: 'image' | 'avatar' | 'background', file?: File) => void = (type, file) => {
    if (file && type) {
      const imageSetConvert = { image: setImage, avatar: setAvatarImage, background: setBackgroundImage }
      const imagePropConvert = { image: 'imageUrl', avatar: 'avatarImageUrl', background: 'backgroundImageUrl' }
      const imageSizeConvert = { image: null, avatar: '400', background: '800' }
      setLoading(true)
      const imageId = uuid()
      uploadFile(`images/${appId}/craft/${imageId}`, file, authToken)
        .then(() => {
          imageSetConvert[type](file)
          setProp(props => {
            props[imagePropConvert[type]] = `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${
              imageId +
              (file.type.startsWith('image') ? (imageSizeConvert[type] ? '/' + imageSizeConvert[type] : '') : '')
            }`
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
        imageType: props.imageType || 'image',
        coverImage: props.imageUrl || '',
        imageMargin: `${props.imageMargin?.mt || 0};${props.imageMargin?.mr || 0};${props.imageMargin?.mb || 0};${
          props.imageMargin?.ml || 0
        }`,
        imagePadding: `${props.imagePadding?.pt || 0};${props.imagePadding?.pr || 0};${props.imagePadding?.pb || 0};${
          props.imagePadding?.pl || 0
        }`,
        imageAlign: props.imageAlign || 'flex-start',
        avatarType: props.avatarType || 'none',
        avatarImage: props.avatarImageUrl || '',
        avatarName: props.avatarName || '',
        cardMargin: `${props.cardMargin?.mt || 0};${props.cardMargin?.mr || 0};${props.cardMargin?.mb || 0};${
          props.cardMargin?.ml || 0
        }`,
        cardPadding: `${props.cardPadding?.pt || 0};${props.cardPadding?.pr || 0};${props.cardPadding?.pb || 0};${
          props.cardPadding?.pl || 0
        }`,
        variant: props.variant || 'none',
        outlineColor: props.outlineColor || '',
        backgroundType: props.backgroundType || 'none',
        solidColor: props.solidColor || '#cccccc',
        backgroundImage: props.backgroundImageUrl || '',
        title: props.title || '',
        titleStyle: {
          fontSize: props.titleStyle.fontSize || 16,
          margin: `${props.titleStyle.margin?.mt || 0};${props.titleStyle.margin?.mr || 0};${
            props.titleStyle.margin?.mb || 0
          };${props.titleStyle.margin?.ml || 0}`,
          textAlign: props.titleStyle.textAlign || 'left',
          fontWeight: props.titleStyle.fontWeight || 'normal',
          color: props.titleStyle.color || '#585858',
        },
        paragraph: props?.paragraph || '',
        paragraphStyle: {
          fontSize: props.paragraphStyle?.fontSize || 16,
          margin: `${props.paragraphStyle?.margin?.mt || 0};${props.paragraphStyle?.margin?.mr || 0};${
            props.paragraphStyle?.margin?.mb || 0
          };${props.paragraphStyle?.margin?.ml || 0}`,
          textAlign: props.paragraphStyle?.textAlign || 'left',
          fontWeight: props.paragraphStyle?.fontWeight || 'normal',
          color: props.paragraphStyle?.color || '#585858',
          lineHeight: props.paragraphStyle?.lineHeight || 1,
        },
      }}
      onValuesChange={handleChange}
    >
      {(props.type === 'feature' || props.type === 'featureWithParagraph') && (
        <>
          <Collapse
            className="mt-2 p-0"
            bordered={false}
            expandIconPosition="right"
            ghost
            defaultActiveKey={['imageSetting']}
          >
            <StyledCollapsePanel
              key="imageSetting"
              header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.imageSetting)}</AdminHeaderTitle>}
            >
              <Form.Item name="imageType">
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="none">{formatMessage(craftPageMessages.ui.empty)}</Radio.Button>
                  <Radio.Button value="image">{formatMessage(craftPageMessages.ui.image)}</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="image" noStyle={props.imageType !== 'image'}>
                {props.imageType === 'image' && (
                  <ImageUploader
                    uploading={loading}
                    file={image}
                    initialCoverUrl={props?.imageUrl}
                    onChange={file => handleImageUpload('image', file)}
                  />
                )}
              </Form.Item>
            </StyledCollapsePanel>
          </Collapse>
          {props.imageType === 'image' && (
            <Collapse
              className="mt-2 p-0"
              bordered={false}
              expandIconPosition="right"
              ghost
              defaultActiveKey={['container']}
            >
              <StyledCollapsePanel
                key="container"
                header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.imageStyle)}</AdminHeaderTitle>}
              >
                <Form.Item
                  name="imageMargin"
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
                  name="imagePadding"
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
                <Form.Item name="imageAlign" label={formatMessage(craftPageMessages.label.textAlign)}>
                  <Radio.Group buttonStyle="solid">
                    <Space>
                      <Radio value="flex-start">{formatMessage(craftPageMessages.label.left)}</Radio>
                      <Radio value="center">{formatMessage(craftPageMessages.label.center)}</Radio>
                      <Radio value="flex-end">{formatMessage(craftPageMessages.label.right)}</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </StyledCollapsePanel>
            </Collapse>
          )}
        </>
      )}

      {props.type === 'referrerReverse' && (
        <Collapse
          className="mt-2 p-0"
          bordered={false}
          expandIconPosition="right"
          ghost
          defaultActiveKey={['avatarSetting']}
        >
          <StyledCollapsePanel
            key="avatarSetting"
            header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.avatarSetting)}</AdminHeaderTitle>}
          >
            <Form.Item name="avatarType">
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="none">{formatMessage(craftPageMessages.ui.empty)}</Radio.Button>
                <Radio.Button value="image">{formatMessage(craftPageMessages.ui.image)}</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="avatarImageUrl" noStyle={props.avatarType !== 'image'}>
              {props.avatarType === 'image' && (
                <ImageUploader
                  uploading={loading}
                  file={avatarImage}
                  initialCoverUrl={props.avatarImageUrl}
                  onChange={file => handleImageUpload('avatar', file)}
                />
              )}
            </Form.Item>

            <Form.Item name="avatarName" label={formatMessage(commonMessages.label.name)}>
              <Input onChange={handleChange} />
            </Form.Item>
          </StyledCollapsePanel>
        </Collapse>
      )}
      <>
        <Form.Item name="title">
          <TitleContentBlock onChange={handleChange} />
        </Form.Item>
        <Form.Item name="titleStyle">
          <TextStyleBlock
            type="title"
            title={formatMessage(craftPageMessages.label.titleStyle)}
            onChange={handleChange}
          />
        </Form.Item>
      </>

      {(props.type === 'featureWithParagraph' || props.type === 'referrer' || props.type === 'referrerReverse') && (
        <>
          <Form.Item name="paragraph">
            <ParagraphContentBlock onChange={handleChange} />
          </Form.Item>
          <Form.Item name="paragraphStyle">
            <TextStyleBlock
              type="paragraph"
              title={formatMessage(craftPageMessages.label.paragraphStyle)}
              onChange={handleChange}
            />
          </Form.Item>
        </>
      )}

      {props.type === 'referrer' && (
        <Collapse
          className="mt-2 p-0"
          bordered={false}
          expandIconPosition="right"
          ghost
          defaultActiveKey={['avatarSetting']}
        >
          <StyledCollapsePanel
            key="avatarSetting"
            header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.avatarSetting)}</AdminHeaderTitle>}
          >
            <Form.Item name="avatarType">
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="none">{formatMessage(craftPageMessages.ui.empty)}</Radio.Button>
                <Radio.Button value="image">{formatMessage(craftPageMessages.ui.image)}</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="avatarImageUrl" noStyle={props.avatarType !== 'image'}>
              {props.avatarType === 'image' && (
                <ImageUploader
                  uploading={loading}
                  file={avatarImage}
                  initialCoverUrl={props.avatarImageUrl}
                  onChange={file => handleImageUpload('avatar', file)}
                />
              )}
            </Form.Item>

            <Form.Item name="avatarName" label={formatMessage(commonMessages.label.name)}>
              <Input onChange={handleChange} />
            </Form.Item>
          </StyledCollapsePanel>
        </Collapse>
      )}

      <Collapse className="mt-2 p-0" bordered={false} expandIconPosition="right" ghost defaultActiveKey={['cardStyle']}>
        <StyledCollapsePanel
          key="cardStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.cardStyle)}</AdminHeaderTitle>}
        >
          <Form.Item
            name="cardMargin"
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
            name="cardPadding"
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

      <Form.Item name="variant" label={formatMessage(craftPageMessages.label.variant)}>
        <Radio.Group>
          <Space direction="vertical">
            <Radio value="none">{formatMessage(craftPageMessages.label.none)}</Radio>
            <Radio value="outline">{formatMessage(craftPageMessages.label.outline)}</Radio>
            <Radio value="backgroundColor">{formatMessage(craftPageMessages.label.backgroundColor)}</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item name="outlineColor" noStyle={props.variant !== 'outline'}>
        {props.variant === 'outline' && <ColorPickerBlock />}
      </Form.Item>

      <Form.Item
        name="backgroundType"
        label={formatMessage(craftPageMessages.label.background)}
        noStyle={props.variant !== 'backgroundColor'}
      >
        {props.variant === 'backgroundColor' && (
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="none">{formatMessage(craftPageMessages.ui.empty)}</Radio.Button>
            <Radio.Button value="solidColor">{formatMessage(craftPageMessages.ui.solidColor)}</Radio.Button>
            <Radio.Button value="backgroundImage">{formatMessage(craftPageMessages.ui.image)}</Radio.Button>
          </Radio.Group>
        )}
      </Form.Item>

      <Form.Item
        name="solidColor"
        noStyle={props.variant !== 'backgroundColor' || props.backgroundType !== 'solidColor'}
      >
        {props.variant === 'backgroundColor' && props.backgroundType === 'solidColor' && <ColorPickerBlock />}
      </Form.Item>

      <Form.Item
        name="backgroundImage"
        noStyle={props.variant !== 'backgroundColor' || props.backgroundType !== 'backgroundImage'}
      >
        {props.variant === 'backgroundColor' && props.backgroundType === 'backgroundImage' && (
          <ImageUploader
            uploading={loading}
            file={backgroundImage}
            initialCoverUrl={props.backgroundImageUrl}
            onChange={file => handleImageUpload('background', file)}
          />
        )}
      </Form.Item>
    </Form>
  )
}

export default CardSettings
