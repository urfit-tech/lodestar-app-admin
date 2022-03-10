import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ParagraphProps } from 'lodestar-app-element/src/components/common/Paragraph'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  content: string
  customStyle: CSSObject
}

const ParagraphSettings: CraftElementSettings<ParagraphProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Collapse expandIconPosition="right" ghost defaultActiveKey={['paragraphContent']}>
        <StyledCollapsePanel
          key="paragraphContent"
          header={
            <AdminHeaderTitle>{formatMessage(craftMessages.ParagraphSettings.paragraphContent)}</AdminHeaderTitle>
          }
        >
          <div className="mb-2">
            <CraftSettingLabel>{formatMessage(craftMessages.ParagraphSettings.content)}</CraftSettingLabel>
            <Form.Item>
              <Input.TextArea
                className="mt-2"
                rows={5}
                value={props.content}
                onChange={e => onPropsChange?.({ ...props, content: e.target.value })}
              />
            </Form.Item>
          </div>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="paragraphStyle"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].paragraphStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <TypographyStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
          <Form.Item>
            <BorderStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
          <Form.Item>
            <BackgroundStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ParagraphSettings
