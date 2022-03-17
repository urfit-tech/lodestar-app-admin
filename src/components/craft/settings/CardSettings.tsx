import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CardProps } from 'lodestar-app-element/src/components/cards/Card'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BackgroundInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle?: CSSObject
}

const CardSettings: CraftElementSettings<CardProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.borderStyle,
            ...values.backgroundStyle,
          },
        })
      })
      .catch(() => {})
  }
  const initialValues: FieldValues = {
    spaceStyle: props?.customStyle || {},
    borderStyle: props?.customStyle || {},
    backgroundStyle: props?.customStyle || {},
  }
  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={initialValues}
      onValuesChange={handleChange}
    >
      <Form.Item name="spaceStyle">
        <SpaceStyleInput />
      </Form.Item>

      <Form.Item name="borderStyle">
        <BorderStyleInput />
      </Form.Item>

      <Form.Item name="backgroundStyle">
        <BackgroundInput />
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

export default CardSettings
