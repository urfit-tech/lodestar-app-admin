import { useNode } from '@craftjs/core'
import { Collapse } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import ContentSelector from './ContentSelector'
import { AdminHeaderTitle, StyledCollapsePanel } from './styled'

type FieldProps = {
  contentIds?: string[]
}

const InstructorSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props,
    selected: node.events.selected,
  }))

  const handleChange = (values: FieldProps) => setProp(props => (props.customContentIds = values.contentIds))

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{ contentIds: props.customContentIds }}
      onValuesChange={handleChange}
    >
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['displayItem']}
      >
        <StyledCollapsePanel
          key="displayItem"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.specifyDisplayItem)}</AdminHeaderTitle>}
        >
          <Form.Item name="contentIds">
            <ContentSelector contentType="creator" />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default InstructorSettings
