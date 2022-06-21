import { Form, Input, InputNumber, Radio } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled, { CSSObject } from 'styled-components'
import SampleMargin from '../../../images/icon/sample-margin.svg'
import SamplePadding from '../../../images/icon/sample-padding.svg'
import { CraftSettingLabel } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'

const StyledLabel = styled(CraftSettingLabel)`
  width: 25%;
  text-align: center;
`
const StyledInputNumber = styled(InputNumber)`
  width: 25% !important;
`
const pxFormatter = (value?: string | number) => {
  if (value === 'px') {
    return `0px`
  }
  switch (typeof value) {
    case 'string':
      return `${value.replace(/[^0-9]/gi, '')}px`
    case 'number':
      if (!isNaN(value)) {
        return `${value}px`
      } else {
        return `0px`
      }
    default:
      return `0px`
  }
}

export type SpaceStyle = Pick<CSSObject, 'margin' | 'padding'>
const messages = defineMessages({
  spacing: { id: 'craft.inputs.spacing', defaultMessage: '間距' },
  margin: { id: 'craft.inputs.margin', defaultMessage: '外距' },
  padding: { id: 'craft.inputs.padding', defaultMessage: '內距' },
  top: { id: 'craft.label.top', defaultMessage: '上' },
  right: { id: 'craft.label.right', defaultMessage: '右' },
  bottom: { id: 'craft.label.bottom', defaultMessage: '下' },
  left: { id: 'craft.label.left', defaultMessage: '左' },
})
const SpaceStyleInput: React.VFC<{
  value?: SpaceStyle
  onChange?: (value: SpaceStyle) => void
}> = ({ value, onChange }) => {
  const [spaceTab, setSpaceTab] = useState('padding')

  const paddingArr: string[] | null =
    typeof value?.padding === 'string' && value.padding.split(' ').length === 4
      ? value?.padding.split(' ')
      : ['0px', '0px', '0px', '0px']

  const marginArr: string[] | null =
    typeof value?.margin === 'string' ? value?.margin.split(' ') : ['0px', '0px', '0px', '0px']

  const onSpacingChange = (adjustedPx: number | string | undefined | null, order: number) => {
    if (adjustedPx === null || typeof adjustedPx === undefined || adjustedPx === 'px') {
      adjustedPx = 0
    }
    if (spaceTab === 'margin') {
      marginArr[order] = `${typeof adjustedPx === 'string' ? adjustedPx.replace(/[^0-9]/gi, '') : adjustedPx}px`
      let margin = marginArr.join(' ')
      onChange?.({ ...value, margin })
    } else if (spaceTab === 'padding') {
      paddingArr[order] = `${typeof adjustedPx === 'string' ? adjustedPx.replace(/[^0-9]/gi, '') : adjustedPx}px`
      let padding = paddingArr.join(' ')
      onChange?.({ ...value, padding })
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, order: number) => {
    if (e.target instanceof Element) {
      let value = e.target.getAttribute('value')
      onSpacingChange(value, order)
    }
  }

  const { formatMessage } = useIntl()
  return (
    <>
      <Form.Item label={<CraftSettingLabel>{formatMessage(messages.spacing)}</CraftSettingLabel>}>
        <div className="d-flex justify-content-between align-items-center">
          <Radio.Group
            defaultValue="padding"
            buttonStyle="solid"
            onChange={e => {
              setSpaceTab(e.target.value)
            }}
          >
            <Radio.Button value="padding">{formatMessage(messages.padding)}</Radio.Button>
            <Radio.Button value="margin">{formatMessage(messages.margin)}</Radio.Button>
          </Radio.Group>
          <img src={spaceTab === 'margin' ? SampleMargin : SamplePadding} alt="sample-margin" />
        </div>
        <div className="mt-3">
          <div className="d-flex align-items-center">
            <StyledLabel>{formatMessage(messages.top)}</StyledLabel>
            <StyledLabel>{formatMessage(messages.right)}</StyledLabel>
            <StyledLabel>{formatMessage(messages.bottom)}</StyledLabel>
            <StyledLabel>{formatMessage(messages.left)}</StyledLabel>
          </div>
          <Input.Group>
            <StyledInputNumber
              defaultValue={0}
              value={
                spaceTab === 'margin'
                  ? parseInt(marginArr[0].replace(/[^0-9]/gi, ''))
                  : parseInt(paddingArr[0].replace(/[^0-9]/gi, ''))
              }
              min={0}
              formatter={pxFormatter}
              onChange={top => {
                onSpacingChange(top, 0)
              }}
              onKeyUp={e => handleKeyUp(e, 0)}
            />
            <StyledInputNumber
              defaultValue={0}
              value={
                spaceTab === 'margin'
                  ? parseInt(marginArr[1].replace(/[^0-9]/gi, ''))
                  : parseInt(paddingArr[1].replace(/[^0-9]/gi, ''))
              }
              min={0}
              formatter={pxFormatter}
              onChange={right => {
                onSpacingChange(right, 1)
              }}
            />
            <StyledInputNumber
              defaultValue={0}
              value={
                spaceTab === 'margin'
                  ? parseInt(marginArr[2].replace(/[^0-9]/gi, ''))
                  : parseInt(paddingArr[2].replace(/[^0-9]/gi, ''))
              }
              min={0}
              formatter={pxFormatter}
              onChange={bottom => {
                onSpacingChange(bottom, 2)
              }}
            />
            <StyledInputNumber
              defaultValue={0}
              value={
                spaceTab === 'margin'
                  ? parseInt(marginArr[3].replace(/[^0-9]/gi, ''))
                  : parseInt(paddingArr[3].replace(/[^0-9]/gi, ''))
              }
              min={0}
              formatter={pxFormatter}
              onChange={left => {
                onSpacingChange(left, 3)
              }}
            />
          </Input.Group>
        </div>
      </Form.Item>
    </>
  )
}

export default SpaceStyleInput
