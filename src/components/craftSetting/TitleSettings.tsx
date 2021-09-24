import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftTextStyleProps, CraftTitleProps } from 'lodestar-app-element/src/types/craft'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { formatBoxModelValue } from './BoxModelInput'
import TextStyleBlock from './TextStyleBlock'
import TitleContentBlock from './TitleContentBlock'

type FieldProps = {
  titleContent: string
  titleStyle: Pick<CraftTextStyleProps, 'fontSize' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
}

const TitleSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftTitleProps,
  }))

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const titleMargin = formatBoxModelValue(values.titleStyle.margin)

        setProp(prop => {
          prop.titleContent = values.titleContent
          prop.fontSize = values.titleStyle.fontSize
          prop.margin = {
            mt: titleMargin?.[0] || '0',
            mr: titleMargin?.[1] || '0',
            mb: titleMargin?.[2] || '0',
            ml: titleMargin?.[3] || '0',
          }
          prop.textAlign = values.titleStyle.textAlign
          prop.fontWeight = values.titleStyle.fontWeight
          prop.color = values.titleStyle.color
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
        titleContent: props.titleContent || '',
        titleStyle: {
          fontSize: props.fontSize || 16,
          margin: `${props.margin?.mt || 0};${props.margin?.mr || 0};${props.margin?.mb || 0};${props.margin?.ml || 0}`,
          textAlign: props.textAlign || 'left',
          fontWeight: props.fontWeight || 'normal',
          color: props.color || '#585858',
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
    </Form>
  )
}

export default TitleSettings
