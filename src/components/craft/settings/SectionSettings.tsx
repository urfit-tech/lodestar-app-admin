import { Checkbox, Radio } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { SectionProps } from 'lodestar-app-element/src/components/common/Section'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledUnderLineInput,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'

const messages = defineMessages({
  layout: { id: 'craft.settings.section.layout', defaultMessage: '排列方式' },
  horizontal: { id: 'craft.settings.section.horizontal', defaultMessage: '水平排列' },
  vertical: { id: 'craft.settings.section.vertical', defaultMessage: '垂直排列' },
  horizontalAlign: { id: 'craft.settings.section.horizontalAlign', defaultMessage: '水平對齊' },
  verticalAlign: { id: 'craft.settings.section.verticalAlign', defaultMessage: '垂直對齊' },
  left: { id: 'craft.settings.section.left', defaultMessage: '置左' },
  right: { id: 'craft.settings.section.right', defaultMessage: '置右' },
  center: { id: 'craft.settings.section.center', defaultMessage: '置中' },
  top: { id: 'craft.settings.section.top', defaultMessage: '置頂' },
  bottom: { id: 'craft.settings.section.bottom', defaultMessage: '置底' },
})

const SectionSettings: CraftElementSettings<SectionProps> = ({ props, onPropsChange }) => {
  const [form] = useForm()
  const { formatMessage } = useIntl()
  const handleChange = () => {
    form.validateFields()
  }
  let horizontalAlign, verticalAlign
  if (props.horizontal) {
    horizontalAlign =
      props.customStyle?.justifyContent === 'start'
        ? 'left'
        : props.customStyle?.justifyContent === 'end'
        ? 'right'
        : props.customStyle?.justifyContent === 'center'
        ? 'center'
        : ''
    verticalAlign =
      props.customStyle?.alignItems === 'start'
        ? 'top'
        : props.customStyle?.alignItems === 'end'
        ? 'bottom'
        : props.customStyle?.alignItems === 'center'
        ? 'center'
        : ''
  } else {
    horizontalAlign =
      props.customStyle?.alignItems === 'start'
        ? 'left'
        : props.customStyle?.alignItems === 'end'
        ? 'right'
        : props.customStyle?.alignItems === 'center'
        ? 'center'
        : ''
    verticalAlign =
      props.customStyle?.justifyContent === 'start'
        ? 'top'
        : props.customStyle?.justifyContent === 'end'
        ? 'bottom'
        : props.customStyle?.justifyContent === 'center'
        ? 'center'
        : ''
  }
  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Form.Item>
        <Radio.Group
          buttonStyle="solid"
          value={props.horizontal ? 'horizontal' : 'vertical'}
          onChange={e => onPropsChange?.({ ...props, horizontal: e.target.value === 'horizontal' })}
        >
          <Radio.Button value="horizontal">{formatMessage(messages.horizontal)}</Radio.Button>
          <Radio.Button value="vertical">{formatMessage(messages.vertical)}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(messages.horizontalAlign)}>
        <Radio.Group
          buttonStyle="solid"
          value={horizontalAlign}
          onChange={e =>
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                justifyContent: props.horizontal
                  ? e.target.value === 'left'
                    ? 'start'
                    : e.target.value === 'right'
                    ? 'end'
                    : e.target.value === 'center'
                    ? 'center'
                    : undefined
                  : props.customStyle?.justifyContent,
                alignItems: props.horizontal
                  ? props.customStyle?.alignItems
                  : e.target.value === 'left'
                  ? 'start'
                  : e.target.value === 'right'
                  ? 'end'
                  : e.target.value === 'center'
                  ? 'center'
                  : undefined,
              },
            })
          }
        >
          <Radio.Button value="left">{formatMessage(messages.left)}</Radio.Button>
          <Radio.Button value="center">{formatMessage(messages.center)}</Radio.Button>
          <Radio.Button value="right">{formatMessage(messages.right)}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(messages.verticalAlign)}>
        <Radio.Group
          buttonStyle="solid"
          value={verticalAlign}
          onChange={e =>
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                justifyContent: props.horizontal
                  ? props.customStyle?.justifyContent
                  : e.target.value === 'top'
                  ? 'start'
                  : e.target.value === 'bottom'
                  ? 'end'
                  : e.target.value === 'center'
                  ? 'center'
                  : undefined,
                alignItems: props.horizontal
                  ? e.target.value === 'top'
                    ? 'start'
                    : e.target.value === 'bottom'
                    ? 'end'
                    : e.target.value === 'center'
                    ? 'center'
                    : undefined
                  : props.customStyle?.alignItems,
              },
            })
          }
        >
          <Radio.Button value="top">{formatMessage(messages.top)}</Radio.Button>
          <Radio.Button value="center">{formatMessage(messages.center)}</Radio.Button>
          <Radio.Button value="bottom">{formatMessage(messages.bottom)}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        className="m-0"
        label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.link)}</CraftSettingLabel>}
      >
        <StyledUnderLineInput
          className="mb-2"
          placeholder="https://"
          value={props.link}
          onChange={e => onPropsChange?.({ ...props, link: e.target.value })}
        />
      </Form.Item>
      <Form.Item valuePropName="checked">
        <Checkbox checked={props.openTab} onChange={e => onPropsChange?.({ ...props, openTab: e.target.checked })}>
          {formatMessage(craftPageMessages.label.openNewTab)}
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <SpaceStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BorderStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BackgroundStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
    </Form>
  )
}

export default SectionSettings
