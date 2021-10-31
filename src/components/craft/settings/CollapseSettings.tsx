import { Collapse, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CollapseProps } from 'lodestar-app-element/src/components/collapses/Collapse'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import { CraftSettings, StyledCollapsePanel } from './CraftSettings'

const messages = defineMessages({
  titleStyle: { id: 'craft.settings.collapse.titleStyle', defaultMessage: '標題樣式' },
  paragraphStyle: { id: 'craft.settings.collapse.paragraphStyle', defaultMessage: '內文樣式' },
})
type FieldProps = {
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject

  titleStyle: {
    spaceStyle: CSSObject
    borderStyle: CSSObject
    backgroundStyle: CSSObject
  }

  paragraphStyle: {
    spaceStyle: CSSObject
    borderStyle: CSSObject
    backgroundStyle: CSSObject
  }
}

const CollapseSettings: CraftSettings<CollapseProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          list: [],
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.borderStyle,
            ...values.backgroundStyle,
            '.title': {
              ...values.titleStyle.spaceStyle,
              ...values.titleStyle.borderStyle,
              ...values.titleStyle.backgroundStyle,
            },
            '.paragraph': {
              ...values.paragraphStyle.spaceStyle,
              ...values.paragraphStyle.borderStyle,
              ...values.paragraphStyle.backgroundStyle,
            },
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
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['collapseStyle']}
      >
        <StyledCollapsePanel
          key="titleStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.titleStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <TypographyStyleInput
              value={props.customStyle?.['.title'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.title': { ...(props.customStyle?.['.title'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle?.['.title'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.title': { ...(props.customStyle?.['.title'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="paragraphStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.paragraphStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <TypographyStyleInput
              value={props.customStyle?.['.paragraph'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.paragraph': { ...(props.customStyle?.['.paragraph'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle?.['.paragraph'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.paragraph': { ...(props.customStyle?.['.paragraph'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default CollapseSettings
