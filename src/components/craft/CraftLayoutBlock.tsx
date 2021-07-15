import { Collapse, Input, InputNumber, Select } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import { replace, split } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { CraftLayoutProps } from '../../types/craft'
import {
  AdminHeaderTitle,
  StyledCollapsePanel,
  StyledCraftSettingLabel,
  StyledCraftSlider,
  StyledFullWidthSelect,
  StyledInputNumber,
} from '../admin'

const CraftLayoutBlock: React.VFC<
  {
    title: string
    value?: CraftLayoutProps
    onChange?: (value: CraftLayoutProps) => void
  } & CollapseProps
> = ({ title, value, onChange, ...collapseProps }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      {...collapseProps}
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['desktopLayoutComponent']}
    >
      {typeof value !== 'undefined' && (
        <StyledCollapsePanel key="desktopLayoutComponent" header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
          <div>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.boundary)}</StyledCraftSettingLabel>
            <div className="col-12 p-0 d-flex justify-content-center align-items-center ">
              <div className="col-8 p-0">
                <StyledCraftSlider
                  value={typeof value.padding === 'number' ? value.padding : 0}
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
          </div>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.columnAmount)}</StyledCraftSettingLabel>
            <StyledFullWidthSelect
              className="mt-2"
              value={value.columnAmount.toString() || '3'}
              onChange={v => onChange && onChange({ ...value, columnAmount: Number(v) })}
            >
              <Select.Option key="1" value="1">
                1
              </Select.Option>
              <Select.Option key="2" value="2">
                2
              </Select.Option>
              <Select.Option key="3" value="3">
                3
              </Select.Option>
              <Select.Option key="4" value="4">
                4
              </Select.Option>
              <Select.Option key="6" value="6">
                6
              </Select.Option>
              <Select.Option key="12" value="12">
                12
              </Select.Option>
            </StyledFullWidthSelect>
          </div>

          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.ratio)}</StyledCraftSettingLabel>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.ratio)}</StyledCraftSettingLabel>
            <Input
              className="mt-2"
              defaultValue={replace(/,/g, ':', value.columnRatio.toString() || '3,3,3')}
              onChange={e =>
                onChange &&
                onChange({
                  ...value,
                  columnRatio: split(':', e.target.value).map(v => parseInt(v)),
                })
              }
            />
          </div>

          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</StyledCraftSettingLabel>
            <div>
              <StyledInputNumber
                className="mt-2"
                value={value.displayAmount}
                onChange={v => onChange && onChange({ ...value, displayAmount: Number(v) })}
              />
            </div>
          </div>
        </StyledCollapsePanel>
      )}
    </Collapse>
  )
}

export default CraftLayoutBlock
