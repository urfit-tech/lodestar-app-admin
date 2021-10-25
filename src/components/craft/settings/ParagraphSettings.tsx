import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ParagraphProps } from 'lodestar-app-element/src/components/common/Paragraph'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import { AdminHeaderTitle, CraftSettingLabel, CraftSettings, StyledCollapsePanel } from './CraftSettings'

type FieldProps = {
  content: string
  spaceStyle: CSSObject
  typographyStyle: CSSObject
}

const ParagraphSettings: CraftSettings<ParagraphProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          content: values.content,
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.typographyStyle,
          },
        })
      })
      .catch(() => {})
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={props}
      onValuesChange={handleChange}
    >
      <Form.Item name="content">
        <ParagraphContentBlock />
      </Form.Item>
      <Form.Item name="spaceStyle">
        <SpaceStyleInput />
      </Form.Item>
      <Form.Item name="typographyStyle">
        <TypographyStyleInput />
      </Form.Item>
    </Form>
  )
}

const ParagraphContentBlock: React.VFC<{ value?: string; onChange?: (value?: string) => void }> = ({
  value,
  onChange,
}) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['paragraphContent']}
    >
      <StyledCollapsePanel
        key="paragraphContent"
        header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.paragraphContent)}</AdminHeaderTitle>}
      >
        <div className="mb-2">
          <CraftSettingLabel>{formatMessage(craftPageMessages.label.content)}</CraftSettingLabel>
          <Input.TextArea className="mt-2" rows={5} defaultValue={value} onChange={e => onChange?.(e.target.value)} />
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default ParagraphSettings
