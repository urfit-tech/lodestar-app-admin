import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useIntl } from 'react-intl'

const EmbedSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<{}>()

  const {
    actions: { setProp },
    props: { type, ids },
  } = useNode(node => ({
    props: node.data.props,
    selected: node.events.selected,
  }))

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{ creatorCollection: { type, ids } }}
      onValuesChange={() => {
        form
          .validateFields()
          .then(values => {
            setProp(props => {
              // props.type = values.creatorCollection.type
              // props.ids = values.creatorCollection.ids
            })
          })
          .catch(() => {})
      }}
    >
      {/* <Collapse
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
          <Form.Item name="creatorCollection">
            <CreatorCollectionSelector />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse> */}
    </Form>
  )
}

export default EmbedSettings
