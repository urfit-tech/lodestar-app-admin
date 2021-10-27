import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ParagraphProps } from 'lodestar-app-element/src/components/common/Paragraph'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle } from '../../admin'
import CustomStyleInput from '../inputs/CustomStyleInput'
import { CraftSettingLabel, CraftSettings, StyledCollapsePanel } from './CraftSettings'

type FieldValues = {
  content: string
  customStyle: CSSObject
}

const ParagraphSettings: CraftSettings<ParagraphProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          content: values.content,
          customStyle: values.customStyle,
        })
      })
      .catch(() => {})
  }

  const initialValues: FieldValues = {
    content: props.content,
    customStyle: props.customStyle || {},
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={initialValues}
      onValuesChange={handleChange}
    >
      <Collapse expandIconPosition="right" ghost defaultActiveKey={['paragraphContent']}>
        <StyledCollapsePanel
          key="paragraphContent"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.paragraphContent)}</AdminHeaderTitle>}
        >
          <div className="mb-2">
            <CraftSettingLabel>{formatMessage(craftPageMessages.label.content)}</CraftSettingLabel>
            <Form.Item name="content">
              <Input.TextArea className="mt-2" rows={5} />
            </Form.Item>
          </div>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="paragraphStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.paragraphStyle)}</AdminHeaderTitle>}
        >
          <Form.Item name="customStyle">
            <CustomStyleInput space border background />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ParagraphSettings
