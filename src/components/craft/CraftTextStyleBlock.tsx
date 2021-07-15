import { Collapse, InputNumber, Radio, Space } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { CraftTextStyleProps } from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel, StyledCraftSlider } from '../admin'
import CraftColorPickerBlock from './CraftColorPickerBlock'

const CraftTextStyleBlock: React.VFC<
  {
    type: 'title' | 'paragraph'
    title: string
    value?: CraftTextStyleProps
    onChange?: (value: CraftTextStyleProps) => void
  } & CollapseProps
> = ({ type, title, value, onChange, ...collapseProps }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      {...collapseProps}
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['contentStyle']}
    >
      {typeof value !== 'undefined' && (
        <StyledCollapsePanel key="contentStyle" header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
          <>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.fontSize)}</StyledCraftSettingLabel>
            <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
              <div className="col-8 p-0">
                <StyledCraftSlider
                  value={typeof value.fontSize === 'number' ? value.fontSize : 0}
                  onChange={(v: number) => {
                    onChange && onChange({ ...value, fontSize: v })
                  }}
                />
              </div>
              <InputNumber
                className="col-4"
                min={0}
                value={value.fontSize}
                onChange={v => {
                  onChange && onChange({ ...value, fontSize: Number(v) })
                }}
              />
            </div>
          </>

          {type === 'paragraph' && (
            <>
              <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.lineHeight)}</StyledCraftSettingLabel>
              <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
                <div className="col-8 p-0">
                  <StyledCraftSlider
                    value={typeof value.lineHeight === 'number' ? value?.lineHeight : 0}
                    onChange={(v: number) => onChange && onChange({ ...value, lineHeight: v })}
                  />
                </div>
                <InputNumber
                  className="col-4"
                  min={0}
                  value={value.lineHeight}
                  onChange={v => onChange && onChange({ ...value, lineHeight: Number(v) })}
                />
              </div>
            </>
          )}

          <>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.boundary)}</StyledCraftSettingLabel>
            <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
              <div className="col-8 p-0">
                <StyledCraftSlider
                  value={typeof value?.padding === 'number' ? value?.padding : 0}
                  onChange={(v: number) => onChange && onChange({ ...value, padding: v })}
                />
              </div>
              <InputNumber
                className="col-4"
                min={0}
                value={value.padding}
                onChange={v => onChange && onChange({ ...value, padding: Number(v) })}
              />
            </div>
          </>
          <div className="d-flex mb-3">
            <div>
              <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.textAlign)}</StyledCraftSettingLabel>
              <div>
                <Radio.Group
                  className="mt-2"
                  value={value.textAlign}
                  onChange={e => onChange && onChange({ ...value, textAlign: e.target.value })}
                >
                  <Space direction="vertical">
                    <Radio value="left">{formatMessage(craftPageMessages.label.left)}</Radio>
                    <Radio value="center">{formatMessage(craftPageMessages.label.center)}</Radio>
                    <Radio value="right">{formatMessage(craftPageMessages.label.right)}</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
            <div className="ml-4">
              <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.fontWeight)}</StyledCraftSettingLabel>
              <div>
                <Radio.Group
                  className="mt-2"
                  value={value.fontWeight}
                  onChange={e => onChange && onChange({ ...value, fontWeight: e.target.value })}
                >
                  <Space direction="vertical">
                    <Radio value="lighter">{formatMessage(craftPageMessages.label.lighter)}</Radio>
                    <Radio value="normal">{formatMessage(craftPageMessages.label.normal)}</Radio>
                    <Radio value="bold">{formatMessage(craftPageMessages.label.bold)}</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
          </div>
          <CraftColorPickerBlock value={value.color} onChange={v => onChange && onChange({ ...value, color: v })} />
        </StyledCollapsePanel>
      )}
    </Collapse>
  )
}

export default CraftTextStyleBlock
