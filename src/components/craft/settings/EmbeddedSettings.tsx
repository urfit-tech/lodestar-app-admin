import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { EmbeddedProps } from 'lodestar-app-element/src/components/common/Embedded'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings, StyledCollapsePanel } from './CraftSettings'

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
      onValuesChange={() => {
        form.validateFields()
      }}
    >
      <Collapse accordion ghost expandIconPosition="right" defaultActiveKey="setting">
        <StyledCollapsePanel
          key="setting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.embedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item
            label={formatMessage(craftPageMessages.label.embedSetting)}
            rules={[
              {
                pattern: /(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/g,
                message: formatMessage(craftPageMessages.text.fillIframeFormatPlz),
              },
            ]}
          >
            <Input.TextArea
              className="mt-2"
              rows={5}
              placeholder="<iframe></iframe>"
              value={props.iframe}
              onChange={e => onPropsChange?.({ ...props, iframe: e.target.value })}
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="style"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.embedStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default EmbeddedSettings
