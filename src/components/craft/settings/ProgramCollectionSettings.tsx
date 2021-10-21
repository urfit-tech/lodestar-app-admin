import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CollectionLayout } from 'lodestar-app-element/src/components/collections/Collection'
import { ProgramCollectionOptions } from 'lodestar-app-element/src/components/collections/ProgramCollection'
import { ProgramCardCollectionProps } from 'lodestar-app-element/src/components/craft/ProgramCardCollection'
import { useIntl } from 'react-intl'
import LayoutInput from '../../common/LayoutInput'
import ProgramCollectionSelector from '../../program/ProgramCollectionSelector'

const ProgramCollectionSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<{ options: ProgramCollectionOptions; layout: CollectionLayout }>()
  const node = useNode(node => ({
    props: node.data.props as ProgramCardCollectionProps,
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
              props.layout = values.layout
              props.options = values.options
            })
          })
          .catch(console.error)
      }}
    >
      <Form.Item name="options" className="mb-0">
        <ProgramCollectionSelector />
      </Form.Item>
      <Form.Item name="layout">
        <LayoutInput />
      </Form.Item>
    </Form>
  )
}

export default ProgramCollectionSettings
