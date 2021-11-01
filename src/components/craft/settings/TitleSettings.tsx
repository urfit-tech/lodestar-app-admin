import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { TitleProps } from 'lodestar-app-element/src/components/common/Title'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle } from '../../admin'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import { CraftSettingLabel, CraftSettings, StyledCollapsePanel } from './CraftSettings'

type FieldValues = {
  content: string
  customStyle: CSSObject
}

const TitleSettings: CraftSettings<TitleProps> = ({ props, onPropsChange }) => {
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
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.titleContent)}</AdminHeaderTitle>}
        >
          <div className="mb-2">
            <CraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</CraftSettingLabel>
            <Form.Item>
              <Input value={props.title} onChange={e => onPropsChange?.({ ...props, title: e.target.value })} />
            </Form.Item>
          </div>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="titleStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.titleStyle)}</AdminHeaderTitle>}
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
