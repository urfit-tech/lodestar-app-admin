import { Form, Input, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ProjectCollectionProps } from 'lodestar-app-element/src/components/collections/ProjectCollection'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftElementSettings, CraftSettingLabel } from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'
import LayoutInput from '../../common/LayoutInput'
import ProjectCollectionSelector from '../../project/ProjectCollectionSelector'

const ProjectCollectionSettings: CraftElementSettings<ProjectCollectionProps> = ({ props, onPropsChange }) => {
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
        label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.projectSectionId)}</CraftSettingLabel>}
      >
        <Input value={props.name} onChange={e => onPropsChange?.({ ...props, name: e.target.value })} />
      </Form.Item>
      <Form.Item className="mb-0">
        <ProjectCollectionSelector
          value={props.source}
          onChange={source => {
            onPropsChange?.({ ...props, source })
          }}
        />
      </Form.Item>
      <Form.Item
        valuePropName="checked"
        label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.categorySelectorEnabled)}</CraftSettingLabel>}
      >
        <Switch checked={props.withSelector} onChange={withSelector => onPropsChange?.({ ...props, withSelector })} />
      </Form.Item>
      <Form.Item>
        <LayoutInput value={props.layout} onChange={layout => onPropsChange?.({ ...props, layout })} />
      </Form.Item>
    </Form>
  )
}

export default ProjectCollectionSettings
