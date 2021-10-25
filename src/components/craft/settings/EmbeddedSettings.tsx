import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { EmbeddedProps } from 'lodestar-app-element/src/components/common/Embedded'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftCollapseSetting, CraftSettings } from './CraftSettings'

type FieldValues = {
  content: string
  spaceStyle: CSSObject
}
const EmbeddedSettings: CraftSettings<EmbeddedProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

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
              iframe: values.content,
              customStyle: {
                ...props.customStyle,
                ...values.spaceStyle,
              },
            })
          })
          .catch(({ values, errorFields }) => {
            if (errorFields.length > 0) {
              return
            }
            onPropsChange?.({
              iframe: values.content,
              customStyle: {
                ...props.customStyle,
                ...values.spaceStyle,
              },
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

export default EmbeddedSettings
