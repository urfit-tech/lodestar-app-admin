import { useNode, UserComponent } from '@craftjs/core'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftParagraphProps, CraftTextStyleProps, CraftTitleProps } from '../../types/craft'
import { StyledSettingButtonWrapper } from '../admin'
import CraftParagraphContentBlock from './CraftParagraphContentBlock'
import CraftTextStyleBlock from './CraftTextStyleBlock'
import CraftTitleContentBlock from './CraftTitleContentBlock'

const StyledTitle = styled.div<{ customStyle: CraftTextStyleProps }>`
  font-size: ${props => `${props.customStyle.fontSize}px`};
  padding: ${props => `${props.customStyle.padding}px`};
  text-align: ${props => props.customStyle.textAlign};
  font-weight: ${props => props.customStyle.fontWeight};
  color: ${props => props.customStyle.color};
`

const StyledParagraph = styled.div<{ customStyle: CraftParagraphProps }>`
  font-size: ${props => `${props.customStyle.fontSize}px`};
  padding: ${props => `${props.customStyle.padding}px`};
  text-align: ${props => props.customStyle.textAlign};
  font-weight: ${props => props.customStyle.fontWeight};
  color: ${props => props.customStyle.color};
`

type FieldProps = {
  titleContent: string
  titleStyle: CraftTextStyleProps
  paragraphContent: string
  paragraphStyle: CraftTextStyleProps
}

const CraftTitleAndParagraph: UserComponent<
  { title: CraftTitleProps; paragraph: CraftParagraphProps } & {
    setActiveKey: React.Dispatch<React.SetStateAction<string>>
  }
> = ({ title, paragraph, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={ref => ref && connect(drag(ref))} onClick={() => setActiveKey('settings')}>
      <StyledTitle customStyle={title}>{title.titleContent}</StyledTitle>
      <StyledParagraph customStyle={paragraph}>{paragraph.paragraphContent}</StyledParagraph>
    </div>
  )
}

const TitleAndParagraphSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: {
      title: node.data.props.title as CraftTitleProps,
      paragraph: node.data.props.paragraph as CraftParagraphProps,
    },
    selected: node.events.selected,
  }))

  const handleSubmit = (values: FieldProps) => {
    setProp((props: { title: CraftTitleProps; paragraph: CraftParagraphProps }) => {
      props.title.titleContent = values.titleContent
      props.title.fontSize = values.titleStyle.fontSize
      props.title.padding = values.titleStyle.padding
      props.title.textAlign = values.titleStyle.textAlign
      props.title.fontWeight = values.titleStyle.fontWeight
      props.title.color = values.titleStyle.color
      props.paragraph.paragraphContent = values.paragraphContent
      props.paragraph.fontSize = values.paragraphStyle.fontSize
      props.paragraph.lineHeight = values.paragraphStyle.lineHeight
      props.paragraph.padding = values.paragraphStyle.padding
      props.paragraph.textAlign = values.paragraphStyle.textAlign
      props.paragraph.fontWeight = values.paragraphStyle.fontWeight
      props.paragraph.color = values.paragraphStyle.color
    })
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
          padding: props.title.padding || 0,
          textAlign: props.title.textAlign || 'left',
          fontWeight: props.title.fontWeight || 'normal',
          color: props.title.color || '#585858',
        },
        paragraphContent: props.paragraph.paragraphContent || '',
        paragraphStyle: {
          fontSize: props.paragraph.fontSize || 16,
          padding: props.paragraph.padding || 0,
          textAlign: props.paragraph.textAlign || 'left',
          fontWeight: props.paragraph.fontWeight || 'normal',
          color: props.paragraph.color || '#585858',
        },
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="titleContent">
        <CraftTitleContentBlock />
      </Form.Item>
      <Form.Item name="titleStyle">
        <CraftTextStyleBlock type="title" title={formatMessage(craftPageMessages.label.titleStyle)} />
      </Form.Item>
      <Form.Item name="paragraphContent">
        <CraftParagraphContentBlock />
      </Form.Item>
      <Form.Item name="paragraphStyle">
        <CraftTextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
      </Form.Item>
      {selected && (
        <StyledSettingButtonWrapper>
          <Button className="mb-3" type="primary" block htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </StyledSettingButtonWrapper>
      )}
    </Form>
  )
}

CraftTitleAndParagraph.craft = {
  related: {
    settings: TitleAndParagraphSettings,
  },
  custom: {
    button: {
      label: 'deleteBlock',
    },
  },
}

export default CraftTitleAndParagraph
