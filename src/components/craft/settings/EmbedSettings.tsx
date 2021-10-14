import { useNode } from '@craftjs/core'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useIntl } from 'react-intl'
import { CraftCollapseSetting } from '.'
import { craftPageMessages } from '../../../helpers/translation'

const EmbedSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<{
    iframe: string
    margin: `${number};${number};${number};${number}`
  }>()

  const {
    actions: { setProp },
    props: { iframe, margin },
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
      initialValues={{ iframe, margin }}
      onValuesChange={() => {
        form
          .validateFields()
          .then(values => {
            setProp(props => {
              props.margin = values.margin
            })
          })
          .catch(({ values, errorFields }) => {
            if (errorFields.length > 0) {
              return
            }
            setProp(props => {
              props.iframe = values.iframe
            })
          })
      }}
    >
      <Form.Item
        name="iframe"
        rules={[
          {
            pattern: /(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/g,
            message: formatMessage(craftPageMessages.text.fillIframeFormatPlz),
          },
        ]}
      >
        <CraftCollapseSetting
          variant="textarea"
          placeholder="<iframe></iframe>"
          title={formatMessage(craftPageMessages.label.embedSetting)}
        />
      </Form.Item>
      <Form.Item name="margin">
        <CraftCollapseSetting
          variant="slider"
          title={formatMessage(craftPageMessages.label.embedStyle)}
          label={formatMessage(craftPageMessages.label.margin)}
        />
      </Form.Item>
    </Form>
  )
}

export default EmbedSettings
