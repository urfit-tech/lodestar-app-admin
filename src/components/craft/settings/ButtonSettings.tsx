import { Checkbox, Form, Input, Radio, Space } from 'antd'
import Collapse from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import { ButtonProps } from 'lodestar-app-element/src/components/buttons/Button'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
  StyledUnderLineInput,
} from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'

type FieldValues = {
  title: string
  link: string | null
  openNewTab: boolean
  block: boolean
  size: ButtonProps['size']
  variant: ButtonProps['variant']
  customStyle: CSSObject
}

const ButtonSettings: CraftElementSettings<ButtonProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Collapse ghost expandIconPosition="right" defaultActiveKey="buttonSetting">
        <StyledCollapsePanel
          key="buttonSetting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.title}
              onChange={e => onPropsChange?.({ ...props, title: e.target.value })}
            />
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
            <Checkbox
              checked={props.openNewTab}
              onChange={e => onPropsChange?.({ ...props, openNewTab: e.target.checked })}
            >
              {formatMessage(craftPageMessages.label.openNewTab)}
            </Checkbox>
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="buttonStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonStyle)}</AdminHeaderTitle>}
        >
          <Form.Item
            className="ml-4"
            label={
              <CraftSettingLabel className="mb-1">{formatMessage(craftPageMessages.label.size)}</CraftSettingLabel>
            }
            style={{ display: 'inline-block' }}
          >
            <Radio.Group value={props.size} onChange={e => onPropsChange?.({ ...props, size: e.target.value })}>
              <Space direction="vertical">
                <Radio value="lg">{formatMessage(craftPageMessages.label.large)}</Radio>
                <Radio value="md">{formatMessage(craftPageMessages.label.middle)}</Radio>
                <Radio value="sm">{formatMessage(craftPageMessages.label.small)}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.width)}</CraftSettingLabel>}
          >
            <Checkbox checked={props.block} onChange={e => onPropsChange?.({ ...props, block: e.target.checked })}>
              {formatMessage(craftPageMessages.label.buttonBlock)}
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <TypographyStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
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
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ButtonSettings
