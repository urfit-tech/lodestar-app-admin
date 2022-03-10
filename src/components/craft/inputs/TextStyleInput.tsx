import { Collapse, InputNumber, Radio, Space } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftSettingLabel,
  CraftSlider,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import craftMessages from '../translation'
import BoxModelInput from './BoxModelInput'
import ColorPicker from './ColorPicker'

const TextStyleInput: React.VFC<{
  type: 'title' | 'paragraph'
  title: string
  value?: CSSObject
  onChange?: (value: CSSObject) => void
}> = ({ type, title, value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['contentStyle']}
    >
      {typeof value !== 'undefined' && (
        <StyledCollapsePanel key="contentStyle" header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
          <>
            <CraftSettingLabel>{formatMessage(craftMessages['*'].fontSize)}</CraftSettingLabel>
            <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
              <div className="col-8 p-0">
                <CraftSlider
                  value={typeof value.fontSize === 'number' ? value.fontSize : 0}
                  onChange={(v: number) => {
                    onChange?.({ ...value, fontSize: v })
                  }}
                />
              </div>
              <InputNumber
                className="col-4"
                min={0}
                value={Number(value.fontSize)}
                onChange={v => {
                  onChange?.({ ...value, fontSize: Number(v) })
                }}
              />
            </div>
          </>

          {type === 'paragraph' && (
            <>
              <CraftSettingLabel>{formatMessage(craftMessages['*'].lineHeight)}</CraftSettingLabel>
              <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
                <div className="col-8 p-0">
                  <CraftSlider
                    value={typeof value.lineHeight === 'number' ? value?.lineHeight : 0}
                    onChange={(v: number) => onChange?.({ ...value, lineHeight: v })}
                  />
                </div>
                <InputNumber
                  className="col-4"
                  min={0}
                  value={Number(value.lineHeight)}
                  onChange={v => onChange?.({ ...value, lineHeight: Number(v) })}
                />
              </div>
            </>
          )}

          <BoxModelInput
            title={formatMessage(craftMessages.TextStyledInput.margin)}
            value={value.margin?.toString()}
            onChange={v => onChange?.({ ...value, margin: v })}
          />

          <div className="d-flex mb-3">
            <div>
              <CraftSettingLabel>{formatMessage(craftMessages['*'].textAlign)}</CraftSettingLabel>
              <div>
                <Radio.Group
                  className="mt-2"
                  value={value.textAlign}
                  onChange={e => onChange?.({ ...value, textAlign: e.target.value })}
                >
                  <Space direction="vertical">
                    <Radio value="left">{formatMessage(craftMessages['*'].left)}</Radio>
                    <Radio value="center">{formatMessage(craftMessages['*'].center)}</Radio>
                    <Radio value="right">{formatMessage(craftMessages['*'].right)}</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
            <div className="ml-4">
              <CraftSettingLabel>{formatMessage(craftMessages['*'].fontWeight)}</CraftSettingLabel>
              <div>
                <Radio.Group
                  className="mt-2"
                  value={value.fontWeight}
                  onChange={e => onChange?.({ ...value, fontWeight: e.target.value })}
                >
                  <Space direction="vertical">
                    <Radio value="lighter">{formatMessage(craftMessages['*'].lighter)}</Radio>
                    <Radio value="normal">{formatMessage(craftMessages['*'].normal)}</Radio>
                    <Radio value="bold">{formatMessage(craftMessages['*'].bold)}</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
          </div>
          <ColorPicker value={value.color} onChange={v => onChange?.({ ...value, color: v })} />
        </StyledCollapsePanel>
      )}
    </Collapse>
  )
}

export default TextStyleInput
