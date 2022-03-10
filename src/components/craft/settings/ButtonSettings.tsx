import { Checkbox, Form, Input, Radio, Space } from 'antd'
import Collapse from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import { ButtonProps } from 'lodestar-app-element/src/components/buttons/Button'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import ButtonActionSelector from '../../common/ButtonActionSelector'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  title: string
  link: string | null
  openNewTab: boolean
  block: boolean
  size: ButtonProps['size']
  variant: ButtonProps['variant']
  customStyle: CSSObject
  source: ButtonProps['source']
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
          header={<AdminHeaderTitle>{formatMessage(craftMessages.ButtonSettings.buttonSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].title)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.title}
              onChange={e => onPropsChange?.({ ...props, title: e.target.value })}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <ButtonActionSelector
              value={props.source}
              onChange={source => {
                onPropsChange?.({ ...props, source })
              }}
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="buttonStyle"
          header={<AdminHeaderTitle>{formatMessage(craftMessages.ButtonSettings.buttonStyle)}</AdminHeaderTitle>}
        >
          <Form.Item
            className="ml-4"
            label={
              <CraftSettingLabel className="mb-1">{formatMessage(craftMessages.ButtonSettings.size)}</CraftSettingLabel>
            }
            style={{ display: 'inline-block' }}
          >
            <Radio.Group value={props.size} onChange={e => onPropsChange?.({ ...props, size: e.target.value })}>
              <Space direction="vertical">
                <Radio value="lg">{formatMessage(craftMessages.ButtonSettings.large)}</Radio>
                <Radio value="md">{formatMessage(craftMessages.ButtonSettings.middle)}</Radio>
                <Radio value="sm">{formatMessage(craftMessages.ButtonSettings.small)}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            label={<CraftSettingLabel>{formatMessage(craftMessages['*'].width)}</CraftSettingLabel>}
          >
            <Checkbox checked={props.block} onChange={e => onPropsChange?.({ ...props, block: e.target.checked })}>
              {formatMessage(craftMessages.ButtonSettings.buttonBlock)}
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
