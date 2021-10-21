import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { ActivityCardCollectionProps } from 'lodestar-app-element/src/components/craft/ActivityCardCollection'
import ActivityCollectionSelector from '../../activity/ActivityCollectionSelector'
import ResponsiveInput from '../../common/ResponsiveInput'

const ActivityCardCollectionSettings: React.VFC = () => {
  const [form] = useForm<ActivityCardCollectionProps>()

  const node = useNode(node => ({
    props: node.data.props as ActivityCardCollectionProps,
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
              props.options = values.options
            })
          })
          .catch(() => {})
      }}
    >
      <Form.Item name="options" className="mb-0">
        <ActivityCollectionSelector />
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

const GET_APP_ACTIVITY_CATEGORIES = gql`
  query GET_APP_ACTIVITY_CATEGORIES($appId: String!) {
    category(where: { activity_categories: { activity: { app_id: { _eq: $appId } } } }) {
      id
      name
    }
  }
`

export default ActivityCardCollectionSettings
