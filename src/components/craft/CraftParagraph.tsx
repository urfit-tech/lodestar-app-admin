import { useNode, UserComponent } from '@craftjs/core'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftParagraphProps, CraftTextStyleProps } from '../../types/craft'
import { StyledSettingButtonWrapper } from '../admin'
import CraftParagraphContentBlock from './CraftParagraphContentBlock'
import CraftTextStyleBlock from './CraftTextStyleBlock'

type FieldProps = { paragraphContent: string; paragraphStyle: CraftTextStyleProps }

const CraftParagraph: UserComponent<
  CraftParagraphProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }
> = ({ paragraphContent, fontSize, padding, textAlign, fontWeight, color, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={ref => ref && connect(drag(ref))}
      style={{ fontSize, padding: `${padding}px`, textAlign, fontWeight, color }}
      onClick={() => setActiveKey('settings')}
    >
      {paragraphContent}
    </div>
  )
}

const ParagraphSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftParagraphProps,
    selected: node.events.selected,
  }))

  const handleSubmit = (value: FieldProps) => {
    setProp(props => {
      props.paragraphContent = value.paragraphContent
      props.fontSize = value.paragraphStyle.fontSize
      props.lineHeight = value.paragraphStyle.lineHeight
      props.padding = value.paragraphStyle.padding
      props.textAlign = value.paragraphStyle.textAlign
      props.fontWeight = value.paragraphStyle.fontWeight
      props.color = value.paragraphStyle.color
    })
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
          padding: props.padding || 0,
          lineHeight: props?.lineHeight || undefined,
          textAlign: props.textAlign || 'left',
          fontWeight: props.fontWeight || 'normal',
          color: props.color || '#585858',
        },
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="paragraphContent">
        <CraftParagraphContentBlock />
      </Form.Item>
      <Form.Item name="paragraphStyle">
        <CraftTextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
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

CraftParagraph.craft = {
  related: {
    settings: ParagraphSettings,
  },
}

export default CraftParagraph
