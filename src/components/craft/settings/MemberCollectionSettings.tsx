import { Form, Input, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MemberCollectionProps } from 'lodestar-app-element/src/components/collections/MemberCollection'
import { useIntl } from 'react-intl'
import { CraftElementSettings, CraftSettingLabel } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import LayoutInput from '../../common/LayoutInput'
import MemberCollectionSelector from '../../member/MemberCollectionSelector'
import craftMessages from '../translation'

const MemberCollectionSettings: CraftElementSettings<MemberCollectionProps> = ({ props, onPropsChange }) => {
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
          <CraftSettingLabel>{formatMessage(craftMessages.MemberCollectionSetting.memberSectionId)}</CraftSettingLabel>
        }
      >
        <Input value={props.name} onChange={e => onPropsChange?.({ ...props, name: e.target.value })} />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].variant)}</CraftSettingLabel>}>
        <Select value={props.variant} onChange={variant => onPropsChange?.({ ...props, variant })}>
          <Select.Option value="primary">{formatMessage(craftMessages['*'].primary)}</Select.Option>
          <Select.Option value="secondary">{formatMessage(craftMessages['*'].secondary)}</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item className="mb-0">
        <MemberCollectionSelector
          value={props.source}
          onChange={source => {
            onPropsChange?.({ ...props, source })
          }}
        />
      </Form.Item>
      <Form.Item>
        <LayoutInput value={props.layout} onChange={layout => onPropsChange?.({ ...props, layout })} />
      </Form.Item>
    </Form>
  )
}

export default MemberCollectionSettings
