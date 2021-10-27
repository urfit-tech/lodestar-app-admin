import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { TitleProps } from 'lodestar-app-element/src/components/common/Title'
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

const TitleSettings: CraftSettings<TitleProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          title: values.content,
          customStyle: values.customStyle,
        })
      })
      .catch(() => {})
  }

  const initialValues: FieldValues = {
    content: props.title,
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
      <Collapse
        accordion
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['titleContent']}
      >
        <StyledCollapsePanel
          key="titleContent"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.titleContent)}</AdminHeaderTitle>}
        >
          <div className="mb-2">
            <CraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</CraftSettingLabel>
            <Form.Item name="content">
              <Input />
            </Form.Item>
          </div>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="titleStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.titleStyle)}</AdminHeaderTitle>}
        >
          <Form.Item name="customStyle">
            <CustomStyleInput space border typography />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default TitleSettings
