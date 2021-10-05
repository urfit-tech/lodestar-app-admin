import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftParagraphProps, CraftTextStyleProps } from 'lodestar-app-element/src/types/craft'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import { formatBoxModelValue } from './BoxModelInput'
import ParagraphContentBlock from './ParagraphContentBlock'
import TextStyleBlock from './TextStyleBlock'

type FieldProps = {
  paragraphContent: string
  paragraphStyle: Pick<CraftTextStyleProps, 'fontSize' | 'lineHeight' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
}

const ParagraphSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftParagraphProps,
  }))

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const paragraphMargin = formatBoxModelValue(values.paragraphStyle.margin)

        setProp(props => {
          props.paragraphContent = values.paragraphContent
          props.fontSize = values.paragraphStyle.fontSize
          props.lineHeight = values.paragraphStyle.lineHeight
          props.margin = {
            mt: paragraphMargin?.[0] || '0',
            mr: paragraphMargin?.[1] || '0',
            mb: paragraphMargin?.[2] || '0',
            ml: paragraphMargin?.[3] || '0',
          }
          props.textAlign = values.paragraphStyle.textAlign
          props.fontWeight = values.paragraphStyle.fontWeight
          props.color = values.paragraphStyle.color
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
        paragraphContent: props.paragraphContent || '',
        paragraphStyle: {
          fontSize: props.fontSize || 16,
          margin: `${props.margin?.mt || 0};${props.margin?.mr || 0};${props.margin?.mb || 0};${props.margin?.ml || 0}`,
          lineHeight: props?.lineHeight || 1,
          textAlign: props.textAlign || 'left',
          fontWeight: props.fontWeight || 'normal',
          color: props.color || '#585858',
        },
      }}
      onValuesChange={handleChange}
    >
      <Form.Item name="paragraphContent">
        <ParagraphContentBlock />
      </Form.Item>
      <Form.Item name="paragraphStyle">
        <TextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
      </Form.Item>
    </Form>
  )
}

export default ParagraphSettings
