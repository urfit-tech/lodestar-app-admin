import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftParagraphProps, CraftTextStyleProps, CraftTitleProps } from 'lodestar-app-element/src/types/craft'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import { formatBoxModelValue } from './BoxModelInput'
import ParagraphContentBlock from './ParagraphContentBlock'
import TextStyleBlock from './TextStyleBlock'
import TitleContentBlock from './TitleContentBlock'

type FieldProps = {
  titleContent: string
  titleStyle: Pick<CraftTextStyleProps, 'fontSize' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
  paragraphContent: string
  paragraphStyle: Pick<CraftTextStyleProps, 'fontSize' | 'lineHeight' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
}

const TitleAndParagraphSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: {
      title: node.data.props.title as CraftTitleProps,
      paragraph: node.data.props.paragraph as CraftParagraphProps,
    },
  }))

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const titleMargin = formatBoxModelValue(values.titleStyle.margin)
        const paragraphMargin = formatBoxModelValue(values.paragraphStyle.margin)

        setProp(props => {
          props.title.titleContent = values.titleContent
          props.title.fontSize = values.titleStyle.fontSize
          props.title.margin = {
            mt: titleMargin?.[0] || '0',
            mr: titleMargin?.[1] || '0',
            mb: titleMargin?.[2] || '0',
            ml: titleMargin?.[3] || '0',
          }
          props.title.textAlign = values.titleStyle.textAlign
          props.title.fontWeight = values.titleStyle.fontWeight
          props.title.color = values.titleStyle.color
          props.paragraph.paragraphContent = values.paragraphContent
          props.paragraph.fontSize = values.paragraphStyle.fontSize
          props.paragraph.lineHeight = values.paragraphStyle.lineHeight
          props.paragraph.margin = {
            mt: paragraphMargin?.[0] || '0',
            mr: paragraphMargin?.[1] || '0',
            mb: paragraphMargin?.[2] || '0',
            ml: paragraphMargin?.[3] || '0',
          }
          props.paragraph.textAlign = values.paragraphStyle.textAlign
          props.paragraph.fontWeight = values.paragraphStyle.fontWeight
          props.paragraph.color = values.paragraphStyle.color
        })
      })
      .catch(() => {})
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{
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
          margin: `${props.paragraph.margin?.mt || 0};${props.paragraph.margin?.mr || 0};${
            props.paragraph.margin?.mb || 0
          };${props.paragraph.margin?.ml || 0}`,
          textAlign: props.paragraph.textAlign || 'left',
          fontWeight: props.paragraph.fontWeight || 'normal',
          color: props.paragraph.color || '#585858',
          lineHeight: props.paragraph?.lineHeight || 1,
        },
      }}
      onValuesChange={handleChange}
    >
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

export default TitleAndParagraphSettings
