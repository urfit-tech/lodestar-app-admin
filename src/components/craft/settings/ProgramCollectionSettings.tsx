import { useNode } from '@craftjs/core'
import { Form, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftProgramCollectionProps } from 'lodestar-app-element/src/components/craft/CraftProgramCollection'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftSettingLabel } from '../../admin'
import ResponsiveInput from '../../common/ResponsiveInput'
import ProgramCollectionSelector from '../../program/ProgramCollectionSelector'

const ProgramCollectionSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<CraftProgramCollectionProps>()
  const node = useNode(node => ({
    props: node.data.props as CraftProgramCollectionProps,
  }))
  return (
    <Form
      className="pt-3"
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={node.props}
      onValuesChange={(changedValues, currentValues) => {
        form
          .validateFields()
          .then(values => {
            node.actions.setProp(props => {
              props.gap = values.gap
              props.gutter = values.gutter
              props.columns = values.columns
              props.options = values.options
              props.withSelector = values.withSelector
            })
          })
          .catch(console.error)
      }}
    >
      <Form.Item
        name="withSelector"
        valuePropName="checked"
        label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.categorySelectorEnabled)}</CraftSettingLabel>}
      >
        <Switch />
      </Form.Item>
      <Form.Item name="options" className="mb-0">
        <ProgramCollectionSelector />
      </Form.Item>
      <Form.Item name="columns">
        <ResponsiveInput label="columns" />
      </Form.Item>
      <Form.Item name="gutter">
        <ResponsiveInput label="gutter" />
      </Form.Item>
      <Form.Item name="gap">
        <ResponsiveInput label="gap" />
      </Form.Item>
    </Form>
  )
}

export default ProgramCollectionSettings
