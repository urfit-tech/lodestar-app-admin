import { Form, Input, Select, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ProgramCollectionProps } from 'lodestar-app-element/src/components/collections/ProgramCollection'
import { useIntl } from 'react-intl'
import { CraftElementSettings, CraftSettingLabel } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import LayoutInput from '../../common/LayoutInput'
import ProgramCollectionSelector from '../../program/ProgramCollectionSelector'
import craftMessages from '../translation'

const ProgramCollectionSettings: CraftElementSettings<ProgramCollectionProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()

  return (
    <Form
      className="pt-3"
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      onValuesChange={() => {
        form.validateFields()
      }}
    >
      <Form.Item
        label={
          <CraftSettingLabel>
            {formatMessage(craftMessages.ProgramCollectionSetting.programSectionId)}
          </CraftSettingLabel>
        }
      >
        <Input value={props.name} onChange={e => onPropsChange?.({ ...props, name: e.target.value })} />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].variant)}</CraftSettingLabel>}>
        <Select
          value={props.variant === 'primary' || props.variant === 'secondary' ? props.variant : 'primary'}
          onChange={variant => onPropsChange?.({ ...props, variant })}
        >
          <Select.Option value="primary">{formatMessage(craftMessages['*'].primary)}</Select.Option>
          <Select.Option value="secondary">{formatMessage(craftMessages['*'].secondary)}</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item className="mb-0">
        <ProgramCollectionSelector value={props.source} onChange={source => onPropsChange?.({ ...props, source })} />
      </Form.Item>
      <Form.Item
        valuePropName="checked"
        label={<CraftSettingLabel>{formatMessage(craftMessages['*'].categorySelectorEnabled)}</CraftSettingLabel>}
      >
        <Switch checked={props.withSelector} onChange={withSelector => onPropsChange?.({ ...props, withSelector })} />
      </Form.Item>
      <Form.Item>
        <LayoutInput value={props.layout} onChange={layout => onPropsChange?.({ ...props, layout })} />
      </Form.Item>
    </Form>
  )
}

export default ProgramCollectionSettings
