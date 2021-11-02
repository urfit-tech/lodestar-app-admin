import { Form, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { ActivityCollectionProps } from 'lodestar-app-element/src/components/collections/ActivityCollection'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftElementSettings, CraftSettingLabel } from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'
import ActivityCollectionSelector from '../../activity/ActivitySourceOptionSelector'
import LayoutInput from '../../common/LayoutInput'

const ActivityCollectionSettings: CraftElementSettings<ActivityCollectionProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<ActivityCollectionProps>()

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={props}
      onValuesChange={() => {
        form
          .validateFields()
          .then(values => {
            onPropsChange?.({
              layout: values.layout,
              sourceOptions: values.sourceOptions,
              withSelector: values.withSelector,
            })
          })
          .catch(() => {})
      }}
    >
      <Form.Item name="sourceOptions" className="mb-0">
        <ActivityCollectionSelector />
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

const GET_APP_ACTIVITY_CATEGORIES = gql`
  query GET_APP_ACTIVITY_CATEGORIES($appId: String!) {
    category(where: { activity_categories: { activity: { app_id: { _eq: $appId } } } }) {
      id
      name
    }
  }
`

export default ActivityCollectionSettings
