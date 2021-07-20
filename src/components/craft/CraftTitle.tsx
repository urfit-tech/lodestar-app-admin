import { useNode, UserComponent } from '@craftjs/core'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftTextStyleProps, CraftTitleProps } from '../../types/craft'
import { StyledSettingButtonWrapper } from '../admin'
import CraftTextStyleBlock from './CraftTextStyleBlock'
import CraftTitleContentBlock from './CraftTitleContentBlock'

type FieldProps = {
  titleContent: string
  titleStyle: CraftTextStyleProps
}

const CraftTitle: UserComponent<CraftTitleProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({
  titleContent,
  fontSize,
  padding,
  textAlign,
  fontWeight,
  color,
  setActiveKey,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={ref => ref && connect(drag(ref))}
      style={{ color, padding: `${padding}px`, fontSize, textAlign, fontWeight, cursor: 'pointer' }}
      onClick={() => setActiveKey('settings')}
    >
      {titleContent}
    </div>
  )
}

const TitleSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftTitleProps,
    selected: node.events.selected,
  }))

  const handleSubmit = (values: FieldProps) => {
    setProp(prop => {
      prop.titleContent = values.titleContent
      prop.fontSize = values.titleStyle.fontSize
      prop.padding = values.titleStyle.padding
      prop.textAlign = values.titleStyle.textAlign
      prop.fontWeight = values.titleStyle.fontWeight
      prop.color = values.titleStyle.color
    })
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
          padding: props.padding || 0,
          textAlign: props.textAlign || 'left',
          fontWeight: props.fontWeight || 'normal',
          color: props.color || '#585858',
        },
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="titleContent">
        <CraftTitleContentBlock />
      </Form.Item>
      <Form.Item name="titleStyle">
        <CraftTextStyleBlock type="title" title={`${formatMessage(craftPageMessages.label.title)}`} />
      </Form.Item>
      {selected && (
        <StyledSettingButtonWrapper>
          <Button className="mb-3" type="primary" htmlType="submit" block>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </StyledSettingButtonWrapper>
      )}
    </Form>
  )
}

CraftTitle.craft = {
  related: {
    settings: TitleSettings,
  },
}

export default CraftTitle
