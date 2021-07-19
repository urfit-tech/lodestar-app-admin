import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, Form, Radio, Space } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftMarginProps, CraftTextStyleProps } from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSlider, StyledSettingButtonWrapper } from '../admin'
import ImageUploader from '../common/ImageUploader'
import CraftColorPickerBlock from './CraftColorPickerBlock'
import CraftParagraphContentBlock from './CraftParagraphContentBlock'
import CraftTextStyleBlock from './CraftTextStyleBlock'
import CraftTitleContentBlock from './CraftTitleContentBlock'

const StyledCollapse = styled.div<{
  customStyle: {
    title: string
    titleStyle: CraftTextStyleProps
    cardPadding: number
    cardMargin: CraftMarginProps
    solidColor?: string
  }
}>`
  padding: ${props => `${props.customStyle.cardPadding}px`};
  margin: ${props =>
    props.customStyle.cardMargin.m
      ? props.customStyle.cardMargin.m
      : `${props.customStyle.cardMargin.mt}px ${props.customStyle.cardMargin.mr}px ${props.customStyle.cardMargin.mb}px ${props.customStyle.cardMargin.ml}px`};
  color: ${props => props.customStyle.titleStyle.color};
  font-size: ${props => `${props.customStyle.titleStyle.fontSize}px`};
  font-weight: ${props => props.customStyle.titleStyle.fontWeight};
  background-color: ${props => props.customStyle.solidColor || ''};
`

type FieldProps = {
  title: string
  titleStyle: CraftTextStyleProps
  paragraph: string
  paragraphStyle: CraftTextStyleProps
  cardPadding: number
  cardMargin: CraftMarginProps
  variant: 'backgroundColor' | 'outline' | 'none'
  outlineColor?: string
  backgroundType?: 'none' | 'solidColor' | 'backgroundImage'
  solidColor?: string
  backgroundImageUrl?: string
}

const CraftCollapse: UserComponent<FieldProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({
  cardPadding,
  cardMargin,
  variant,
  outlineColor,
  backgroundType,
  solidColor,
  backgroundImageUrl,
  title,
  titleStyle,
  paragraph,
  paragraphStyle,
  setActiveKey,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <StyledCollapse
      ref={ref => ref && connect(drag(ref))}
      customStyle={{
        cardPadding,
        cardMargin,
        title,
        titleStyle,
        solidColor,
      }}
      style={{ cursor: 'pointer' }}
      onClick={() => setActiveKey('settings')}
    >
      {title}
    </StyledCollapse>
  )
}

const CollapseSettings = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as FieldProps,
    selected: node.events.selected,
  }))

  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)

  const handleSubmit = (values: FieldProps) => {
    setProp((props: FieldProps) => {
      props.cardPadding = values.cardPadding
      props.cardMargin = values.cardMargin
      props.variant = values.variant
      props.outlineColor = values.outlineColor
      props.solidColor = values.solidColor
      props.backgroundImageUrl = values.backgroundImageUrl
      props.title = values.title
      props.titleStyle.fontSize = values.titleStyle.fontSize
      props.titleStyle.padding = values.titleStyle.padding
      props.titleStyle.textAlign = values.titleStyle.textAlign
      props.titleStyle.fontWeight = values.titleStyle.fontWeight
      props.titleStyle.color = values.titleStyle.color
      props.paragraph = values.paragraph
      props.paragraphStyle.fontSize = values?.paragraphStyle.fontSize
      props.paragraphStyle.lineHeight = values?.paragraphStyle.lineHeight
      props.paragraphStyle.padding = values?.paragraphStyle.padding
      props.paragraphStyle.textAlign = values?.paragraphStyle.textAlign
      props.paragraphStyle.fontWeight = values?.paragraphStyle.fontWeight
      props.paragraphStyle.color = values?.paragraphStyle.color
    })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{
        cardPadding: props.cardPadding || 0,
        cardMargin: props.cardMargin || { m: '0;0;0;0' },
        variant: props.variant || 'none',
        outlineColor: props.outlineColor || '#585858',
        background: props.backgroundType || 'none',
        solidColor: props.solidColor || '#cccccc',
        backgroundImage: props.backgroundImageUrl || '',
        title: props.title || '',
        titleStyle: {
          fontSize: props.titleStyle.fontSize || 16,
          padding: props.titleStyle.padding || 0,
          textAlign: props.titleStyle.textAlign || 'left',
          fontWeight: props.titleStyle.fontWeight || 'normal',
          color: props.titleStyle.color || '#585858',
        },
        paragraph: props.paragraph || '',
        paragraphStyle: {
          fontSize: props.paragraphStyle.fontSize || 16,
          padding: props.paragraphStyle.padding || 0,
          textAlign: props.paragraphStyle.textAlign || 'left',
          fontWeight: props.paragraphStyle.fontWeight || 'normal',
          color: props.paragraphStyle.color || '#585858',
        },
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="title">
        <CraftTitleContentBlock />
      </Form.Item>
      <Form.Item name="titleStyle">
        <CraftTextStyleBlock type="title" title={formatMessage(craftPageMessages.label.titleStyle)} />
      </Form.Item>
      <Form.Item name="paragraph">
        <CraftParagraphContentBlock />
      </Form.Item>
      <Form.Item name="paragraphStyle">
        <CraftTextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
      </Form.Item>

      <Collapse
        {...collapseProps}
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['cardStyle']}
      >
        <StyledCollapsePanel
          key="cardStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.cardStyle)}</AdminHeaderTitle>}
        >
          <Form.Item name="cardPadding" label={formatMessage(craftPageMessages.label.padding)}>
            <StyledCraftSlider />
          </Form.Item>

          <Form.Item name="cardMargin" label={formatMessage(craftPageMessages.label.margin)}>
            <StyledCraftSlider />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>

      <Form.Item name="variant" label={formatMessage(craftPageMessages.label.variant)}>
        <Radio.Group onChange={e => setProp((props: FieldProps) => (props.variant = e.target.value))}>
          <Space direction="vertical">
            <Radio value="none">{formatMessage(craftPageMessages.label.none)}</Radio>
            <Radio value="outline">{formatMessage(craftPageMessages.label.outline)}</Radio>
            <Radio value="backgroundColor">{formatMessage(craftPageMessages.label.backgroundColor)}</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {props.variant === 'outline' && (
        <Form.Item name="outlineColor">
          <CraftColorPickerBlock />
        </Form.Item>
      )}

      {props.variant === 'backgroundColor' && (
        <Form.Item name="background" label={formatMessage(craftPageMessages.label.background)}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button
              value="none"
              onChange={() =>
                setProp((props: FieldProps) => {
                  props.backgroundType = 'none'
                })
              }
            >
              {formatMessage(craftPageMessages.ui.empty)}
            </Radio.Button>
            <Radio.Button
              value="solidColor"
              onChange={() =>
                setProp((props: FieldProps) => {
                  props.backgroundType = 'solidColor'
                })
              }
            >
              {formatMessage(craftPageMessages.ui.solidColor)}
            </Radio.Button>
            <Radio.Button
              value="backgroundImage"
              onChange={() =>
                setProp((props: FieldProps) => {
                  props.backgroundType = 'backgroundImage'
                })
              }
            >
              {formatMessage(craftPageMessages.ui.image)}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      )}

      {props.variant === 'backgroundColor' && props.backgroundType === 'solidColor' && (
        <Form.Item name="solidColor">
          <CraftColorPickerBlock />
        </Form.Item>
      )}

      {props.variant === 'backgroundColor' && props.backgroundType === 'backgroundImage' && (
        <Form.Item name="backgroundImage">
          <ImageUploader
            file={backgroundImage}
            initialCoverUrl={props.backgroundImageUrl}
            onChange={file => {
              setBackgroundImage(file)
            }}
          />
        </Form.Item>
      )}
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

CraftCollapse.craft = {
  related: {
    settings: CollapseSettings,
  },
}

export default CraftCollapse
