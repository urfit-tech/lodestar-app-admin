import { useQuery } from '@apollo/react-hooks'
import { useNode } from '@craftjs/core'
import { Collapse, Form, Select, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { ActivityCollection } from 'lodestar-app-element/src/types/data'
import { useIntl } from 'react-intl'
import hasura from '../../../hasura'
import { craftPageMessages } from '../../../helpers/translation'
import ActivityCollectionSelector from '../../activity/ActivityCollectionSelector'
import { AdminHeaderTitle, CraftSettingLabel, StyledCollapsePanel } from '../../admin'

const ActivitySettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { data } = useQuery<hasura.GET_APP_ACTIVITY_CATEGORIES, hasura.GET_APP_ACTIVITY_CATEGORIESVariables>(
    GET_APP_ACTIVITY_CATEGORIES,
    { variables: { appId } },
  )
  const [form] = useForm<{
    activityCollection: ActivityCollection
    categorySelectorEnabled: boolean
    defaultCategoryIds: string[]
  }>()

  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props,
    selected: node.events.selected,
  }))

  const categories = data?.category.map(v => ({ id: v.id, name: v.name })) || []

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{
        activityCollection: { type: props.type, ids: props.ids },
        categorySelectorEnabled: props.withSelector,
        defaultCategoryIds: props.defaultCategoryIds,
      }}
      onValuesChange={() => {
        form
          .validateFields()
          .then(values => {
            setProp(props => {
              props.withSelector = values.categorySelectorEnabled
              props.defaultCategoryIds = values.defaultCategoryIds || []
              props.type = values.activityCollection.type
              props.ids = values.activityCollection.ids
            })
          })
          .catch(() => {})
      }}
    >
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['displayItem', 'categorySelector']}
      >
        <StyledCollapsePanel
          key="displayItem"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.specifyDisplayItem)}</AdminHeaderTitle>}
        >
          <Form.Item name="activityCollection">
            <ActivityCollectionSelector />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="categorySelector"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.categorySelector)}</AdminHeaderTitle>}
        >
          <Form.Item
            name="categorySelectorEnabled"
            valuePropName="checked"
            label={
              <CraftSettingLabel>{formatMessage(craftPageMessages.label.categorySelectorEnabled)}</CraftSettingLabel>
            }
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="defaultCategoryIds"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.defaultCategoryId)}</CraftSettingLabel>}
          >
            <Select
              showSearch
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder={formatMessage(craftPageMessages.text.chooseCategories)}
              optionFilterProp="children"
              filterOption={(input, option) => option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
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

export default ActivitySettings
