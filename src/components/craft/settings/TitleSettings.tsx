import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { TitleProps } from 'lodestar-app-element/src/components/common/Title'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  content: string
  customStyle: CSSObject
}

const TitleSettings: CraftElementSettings<TitleProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['titleContent']}
      >
        <StyledCollapsePanel
          key="titleContent"
          header={<AdminHeaderTitle>{formatMessage(craftMessages.TitleSettings.titleContent)}</AdminHeaderTitle>}
        >
          <div className="mb-2">
            <CraftSettingLabel>{formatMessage(craftMessages['*'].title)}</CraftSettingLabel>
            <Form.Item>
              <Input value={props.title} onChange={e => onPropsChange?.({ ...props, title: e.target.value })} />
            </Form.Item>
          </div>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="titleStyle"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].titleStyle)}</AdminHeaderTitle>}
        >
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
            <TypographyStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default TitleSettings
