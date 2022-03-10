import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { EmbeddedProps } from 'lodestar-app-element/src/components/common/Embedded'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { CraftElementSettings, StyledCollapsePanel } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  content: string
  spaceStyle: CSSObject
}
const EmbeddedSettings: CraftElementSettings<EmbeddedProps> = ({ props, onPropsChange }) => {
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
      <Collapse ghost expandIconPosition="right" defaultActiveKey="setting">
        <StyledCollapsePanel
          key="setting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages.EmbeddedSettings.embedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item
            label={formatMessage(craftMessages.EmbeddedSettings.embedSetting)}
            rules={[
              {
                pattern: /(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/g,
                message: formatMessage(craftMessages.EmbeddedSettings.fillIframeFormatPlz),
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
          header={<AdminHeaderTitle>{formatMessage(craftMessages.EmbeddedSettings.embedStyle)}</AdminHeaderTitle>}
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
