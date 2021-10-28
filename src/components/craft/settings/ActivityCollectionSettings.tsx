import { useNode } from '@craftjs/core'
import { Form, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { CraftActivityCollectionProps } from 'lodestar-app-element/src/components/craft/CraftActivityCollection'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../../helpers/translation'
import ActivityCollectionSelector from '../../activity/ActivitySourceOptionSelector'
import { CraftSettingLabel } from '../../admin'
import LayoutInput from '../../common/LayoutInput'

const ActivityCollectionSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<CraftActivityCollectionProps>()

  const node = useNode(node => ({
    props: node.data.props as CraftActivityCollectionProps,
  }))

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={node.props}
      onValuesChange={() => {
        form
          .validateFields()
          .then(values => {
            node.actions.setProp(props => {
              props.layout = values.layout
              props.sourceOptions = values.sourceOptions
              props.withSelector = values.withSelector
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
