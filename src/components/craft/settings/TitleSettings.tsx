import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { TitleProps } from 'lodestar-app-element/src/components/common/Title'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import { AdminHeaderTitle, CraftSettingLabel, CraftSettings, StyledCollapsePanel } from './CraftSettings'

type FieldProps = {
  titleContent: string
  typographyStyle: CSSObject
}

const TitleSettings: CraftSettings<TitleProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          title: values.titleContent,
          customStyle: {
            ...props.customStyle,
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
      <Form.Item name="titleContent">
        <TitleContentBlock />
      </Form.Item>
      <Form.Item name="typographyStyle">
        <TypographyStyleInput />
      </Form.Item>
    </Form>
  )
}

const TitleContentBlock: React.VFC<{ value?: string; onChange?: (value?: string) => void }> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
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
          <Input className="mt-2" value={value} onChange={e => onChange?.(e.target.value)} />
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default TitleSettings
