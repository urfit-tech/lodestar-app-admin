import { useNode } from '@craftjs/core'
import { Collapse, Form, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftStatisticsProps } from 'lodestar-app-element/src/components/craft/CraftStatistics'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { CraftBoxModelProps, CraftImageProps, CraftTextStyleProps } from 'lodestar-app-element/src/types/craft'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { handleError, uploadFile } from '../../helpers/index'
import { craftPageMessages } from '../../helpers/translation'
import ImageUploader from '../common/ImageUploader'
import BoxModelInput, { formatBoxModelValue } from './BoxModelInput'
import ParagraphContentBlock from './ParagraphContentBlock'
import { AdminHeaderTitle, StyledCollapsePanel } from './styled'
import TextStyleBlock from './TextStyleBlock'
import TitleContentBlock from './TitleContentBlock'

type FieldProps = {
  type: CraftImageProps['type']
  padding: string
  margin: string
  titleContent: string
  titleStyle: Pick<CraftTextStyleProps, 'fontSize' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
  paragraphContent: string
  paragraphStyle: Pick<CraftTextStyleProps, 'fontSize' | 'lineHeight' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
}

const StatisticsSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftBoxModelProps & CraftStatisticsProps,
    selected: node.events.selected,
  }))
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const padding = formatBoxModelValue(values.padding)
        const margin = formatBoxModelValue(values.margin)
        const titleMargin = formatBoxModelValue(values.titleStyle.margin)
        const paragraphMargin = formatBoxModelValue(values.paragraphStyle.margin)

        setProp(props => {
          props.type = values.type
          props.padding = {
            pt: padding?.[0] || '0',
            pr: padding?.[1] || '0',
            pb: padding?.[2] || '0',
            pl: padding?.[3] || '0',
          }
          props.margin = {
            mt: margin?.[0] || '0',
            mr: margin?.[1] || '0',
            mb: margin?.[2] || '0',
            ml: margin?.[3] || '0',
          }
          props.title = {
            titleContent: values.titleContent,
            fontSize: values.titleStyle.fontSize,
            margin: {
              mt: titleMargin?.[0] || '0',
              mr: titleMargin?.[1] || '0',
              mb: titleMargin?.[2] || '0',
              ml: titleMargin?.[3] || '0',
            },
            textAlign: values.titleStyle.textAlign,
            fontWeight: values.titleStyle.fontWeight,
            color: values.titleStyle.color,
          }
          props.paragraph = {
            paragraphContent: values.paragraphContent,
            fontSize: values.paragraphStyle.fontSize,
            margin: {
              mt: paragraphMargin?.[0] || '0',
              mr: paragraphMargin?.[1] || '0',
              mb: paragraphMargin?.[2] || '0',
              ml: paragraphMargin?.[3] || '0',
            },
            lineHeight: values.paragraphStyle.lineHeight,
            textAlign: values.paragraphStyle.textAlign,
            fontWeight: values.paragraphStyle.fontWeight,
            color: values.paragraphStyle.color,
          }
        })
      })
      .catch(() => {})
  }

  const handleImageUpload = (file?: File) => {
    if (file) {
      const uniqId = uuid()
      setLoading(true)
      uploadFile(`images/${appId}/craft/${uniqId}`, file, authToken)
        .then(() => {
          setCoverImage(file)
          setProp(props => {
            props.coverUrl = `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${uniqId}`
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
        type: props.type || 'image',
        coverImage: props.coverUrl,
        padding: `${props.padding?.pt || 0};${props.padding?.pr || 0};${props.padding?.pb || 0};${
          props.padding?.pl || 0
        }`,
        margin: `${props.margin?.mt || 0};${props.margin?.mr || 0};${props.margin?.mb || 0};${props.margin?.ml || 0}`,
        titleContent: props.title.titleContent || '',
        titleStyle: {
          fontSize: props.title.fontSize || 16,
          margin: `${props.title.margin?.mt || 0};${props.title.margin?.mr || 0};${props.title.margin?.mb || 0};${
            props.title.margin?.ml || 0
          }`,
          textAlign: props.title.textAlign || 'left',
          fontWeight: props.title.fontWeight || 'normal',
          color: props.title.color || '#585858',
        },
        paragraphContent: props.paragraph.paragraphContent || '',
        paragraphStyle: {
          fontSize: props.paragraph.fontSize || 16,
          lineHeight: props.paragraph.lineHeight || 1,
          margin: `${props.paragraph.margin?.mt || 0};${props.paragraph.margin?.mr || 0};${
            props.paragraph.margin?.mb || 0
          };${props.paragraph.margin?.ml || 0}`,
          textAlign: props.paragraph.textAlign || 'left',
          fontWeight: props.paragraph.fontWeight || 'normal',
          color: props.paragraph.color || '#585858',
        },
      }}
      onValuesChange={handleChange}
    >
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
          <Form.Item name="type">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="empty">{formatMessage(craftPageMessages.ui.empty)}</Radio.Button>
              <Radio.Button value="image">{formatMessage(craftPageMessages.ui.image)}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {props.type === 'image' && (
            <Form.Item name="coverImage">
              <ImageUploader
                uploading={loading}
                file={coverImage}
                initialCoverUrl={props.coverUrl}
                onChange={handleImageUpload}
              />
            </Form.Item>
          )}
        </StyledCollapsePanel>
      </Collapse>
      {props.type === 'image' && (
        <Collapse
          className="mt-2 p-0"
          bordered={false}
          expandIconPosition="right"
          ghost
          defaultActiveKey={['imageStyle']}
        >
          <StyledCollapsePanel
            key="imageStyle"
            header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.imageStyle)}</AdminHeaderTitle>}
          >
            <Form.Item
              name="margin"
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
              name="padding"
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
      )}
      <Form.Item name="titleContent">
        <TitleContentBlock />
      </Form.Item>
      <Form.Item name="titleStyle">
        <TextStyleBlock type="title" title={formatMessage(craftPageMessages.label.titleStyle)} />
      </Form.Item>
      <Form.Item name="paragraphContent">
        <ParagraphContentBlock />
      </Form.Item>
      <Form.Item name="paragraphStyle">
        <TextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
      </Form.Item>
    </Form>
  )
}

export default StatisticsSettings
