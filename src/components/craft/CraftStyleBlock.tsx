import { Collapse, InputNumber, Radio, Slider, Space } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { CraftTextStyleProps } from '../../types/craft'
import {
  AdminHeaderTitle,
  StyleCircleColorInput,
  StyledCollapsePanel,
  StyledCraftSettingLabel,
  StyledSketchPicker,
  StyledUnderLineInput,
} from '../admin'

const CraftStyleBlock: React.VFC<
  {
    type: 'title' | 'paragraph'
    title: string
    textStyle: CraftTextStyleProps
    setTextStyle: React.Dispatch<React.SetStateAction<CraftTextStyleProps>>
  } & CollapseProps
> = ({ type, title, textStyle, setTextStyle, ...collapseProps }) => {
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
      <StyledCollapsePanel key="contentStyle" header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
        <>
          <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.fontSize)}</StyledCraftSettingLabel>
          <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
            <div className="col-8 p-0">
              <Slider
                value={typeof textStyle.fontSize === 'number' ? textStyle.fontSize : 0}
                onChange={(value: number) => setTextStyle({ ...textStyle, fontSize: value })}
              />
            </div>
            <InputNumber
              className="col-4"
              value={textStyle.fontSize || 0}
              onChange={value => setTextStyle({ ...textStyle, fontSize: Number(value) })}
            />
          </div>
        </>

        {type === 'paragraph' && (
          <>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.lineHeight)}</StyledCraftSettingLabel>
            <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
              <div className="col-8 p-0">
                <Slider
                  value={typeof textStyle.fontSize === 'number' ? textStyle.lineHeight : 0}
                  onChange={(value: number) => setTextStyle({ ...textStyle, lineHeight: value })}
                />
              </div>
              <InputNumber
                className="col-4"
                value={textStyle.lineHeight || 0}
                onChange={value => setTextStyle({ ...textStyle, lineHeight: Number(value) })}
              />
            </div>
          </>
        )}

        <>
          <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.padding)}</StyledCraftSettingLabel>
          <div className="col-12 mb-2 p-0 d-flex justify-content-center align-items-center ">
            <div className="col-8 p-0">
              <Slider
                value={typeof textStyle.padding === 'number' ? textStyle.padding : 0}
                onChange={(value: number) => setTextStyle({ ...textStyle, padding: value })}
              />
            </div>
            <InputNumber
              className="col-4"
              value={textStyle.padding || 0}
              onChange={value => setTextStyle({ ...textStyle, padding: Number(value) })}
            />
          </div>
        </>
        <div className="d-flex mb-3">
          <div>
            <StyledCraftSettingLabel className="mb-2">
              {formatMessage(craftPageMessages.label.textAlign)}
            </StyledCraftSettingLabel>
            <div>
              <Radio.Group
                value={textStyle.textAlign}
                onChange={value => setTextStyle({ ...textStyle, textAlign: value.target.value })}
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
            <StyledCraftSettingLabel className="mb-2">
              {formatMessage(craftPageMessages.label.fontWeight)}
            </StyledCraftSettingLabel>
            <div>
              <Radio.Group
                value={textStyle.fontWeight}
                onChange={value => setTextStyle({ ...textStyle, fontWeight: value.target.value })}
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
        <>
          <StyledCraftSettingLabel className="mb-2">
            {formatMessage(craftPageMessages.label.color)}
          </StyledCraftSettingLabel>
          <StyledUnderLineInput
            className="mb-3"
            bordered={false}
            value={textStyle.color}
            onChange={e => setTextStyle({ ...textStyle, color: e.target.value })}
          />
          <div className="d-flex mb-3">
            <StyleCircleColorInput
              background="#e1614b"
              onClick={() => setTextStyle({ ...textStyle, color: '#e1614b' })}
            />
            <StyleCircleColorInput
              className="ml-2"
              background="#585858"
              onClick={() => setTextStyle({ ...textStyle, color: '#585858' })}
            />
            <StyleCircleColorInput
              className="ml-2"
              background="#ffffff"
              onClick={() => setTextStyle({ ...textStyle, color: '#ffffff' })}
            />
          </div>
          <StyledSketchPicker
            className="mb-3"
            color={textStyle.color}
            onChange={e => setTextStyle({ ...textStyle, color: e.hex })}
          />
        </>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default CraftStyleBlock
