import { Collapse, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { LayoutProps } from 'lodestar-app-element/src/components/common/Layout'
import { isNil } from 'ramda'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  ratios: string
  spaceStyle: CSSObject
  positionStyle: CSSObject
}

const LayoutSettings: CraftElementSettings<LayoutProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages.LayoutSettings.ratio)}</CraftSettingLabel>}>
        <Input
          value={props.ratios.join(':')}
          onChange={e => onPropsChange?.({ ...props, ratios: e.target.value.split(':').map(v => Number(v.trim())) })}
        />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].spaceStyle)}</CraftSettingLabel>}>
        <SpaceStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].borderStyle)}</CraftSettingLabel>}>
        <BorderStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages.LayoutSettings.gap)}</CraftSettingLabel>}>
        <InputNumber
          value={!isNil(props.customStyle?.gap) ? Number(props.customStyle?.gap) : undefined}
          onChange={v =>
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                gap: !isNil(v) ? Number(v) : undefined,
              },
            })
          }
        />
      </Form.Item>
      <Collapse ghost expandIconPosition="right" defaultActiveKey="buttonSetting">
        <StyledCollapsePanel
          key="advancedSetting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].advancedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].className)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.className}
              onChange={e => onPropsChange?.({ ...props, className: e.target.value.toString() })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default LayoutSettings
