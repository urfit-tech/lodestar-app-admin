import { Form, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CollectionLayout } from 'lodestar-app-element/src/components/collections/Collection'
import { ProgramCollectionProps } from 'lodestar-app-element/src/components/collections/ProgramCollection'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftElementSettings, CraftSettingLabel } from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'
import LayoutInput from '../../common/LayoutInput'
import ProgramCollectionSelector from '../../program/ProgramCollectionSelector'

const ProgramCollectionSettings: CraftElementSettings<ProgramCollectionProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<{ options: ProgramCollectionProps['sourceOptions']; layout: CollectionLayout }>()
  return (
    <Form
      className="pt-3"
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={props}
      onValuesChange={(changedValues, currentValues) => {
        form
          .validateFields()
          .then(values => {
            onPropsChange?.({
              layout: values.layout,
              sourceOptions: values.options,
            })
          })
          .catch(console.error)
      }}
    >
      <Form.Item name="options" className="mb-0">
        <ProgramCollectionSelector />
      </Form.Item>
      <Form.Item
        name="withSelector"
        valuePropName="checked"
        label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.categorySelectorEnabled)}</CraftSettingLabel>}
      >
        <Switch />
      </Form.Item>
      <Form.Item name="layout">
        <LayoutInput />
      </Form.Item>
    </Form>
  )
}

export default ProgramCollectionSettings
