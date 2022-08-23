import { Form, InputNumber, Radio, Space } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { CraftSettingLabel, CraftSlider } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import craftMessages from '../translation'
import ColorPicker from './ColorPicker'

export type Typography = Pick<
  CSSObject,
  'color' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing' | 'textAlign' | 'fontStyle'
>
const TypographyStyleInput: React.VFC<{
  value?: Typography
  onChange?: (value: Typography) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  return (
    <div>
      <Form.Item>
        <ColorPicker value={value?.color} onChange={color => onChange?.({ ...value, color })} />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].fontSize)}</CraftSettingLabel>}>
        <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
          <div className="col-8 p-0">
            <CraftSlider
              value={Number(value?.fontSize) || 0}
              onChange={(fontSize: number) => {
                onChange?.({ ...value, fontSize })
              }}
            />
          </div>
          <InputNumber
            className="col-4"
            min={0}
            value={Number(value?.fontSize)}
            onChange={v => {
              onChange?.({ ...value, fontSize: Number(v) })
            }}
          />
        </div>
      </Form.Item>

      <Form.Item>
        <CraftSettingLabel>{formatMessage(craftMessages['*'].lineHeight)}</CraftSettingLabel>
        <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
          <div className="col-8 p-0">
            <CraftSlider
              value={Number(value?.lineHeight) || 0}
              max={10}
              step={0.1}
              onChange={(v: number) => onChange?.({ ...value, lineHeight: v })}
            />
          </div>
          <InputNumber
            className="col-4"
            min={0}
            step={0.1}
            value={Number(value?.lineHeight)}
            onChange={v => onChange?.({ ...value, lineHeight: Number(v) })}
          />
        </div>
      </Form.Item>

      <div className="d-flex mb-3">
        <div>
          <CraftSettingLabel>{formatMessage(craftMessages['*'].textAlign)}</CraftSettingLabel>
          <div>
            <Radio.Group
              className="mt-2"
              value={value?.textAlign}
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
              value={value?.fontWeight}
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
    </div>
  )
}

export default TypographyStyleInput
