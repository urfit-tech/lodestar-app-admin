import { Collapse, Input, InputNumber } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { CraftBoxModelProps } from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel, StyledCraftSlider } from '../admin'

const CraftBoxModelBlock: React.VFC<
  { value?: CraftBoxModelProps; onChange?: (value?: CraftBoxModelProps) => void } & CollapseProps
> = ({ value, onChange, ...collapseProps }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      {...collapseProps}
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['boxModel']}
    >
      <StyledCollapsePanel
        key="boxModel"
        header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.imageStyle)}</AdminHeaderTitle>}
      >
        <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.boundary)} </StyledCraftSettingLabel>
        <div className="col-12 d-flex justify-content-center align-items-center mb-2 p-0">
          <div className="col-8 p-0">
            <StyledCraftSlider
              min={0}
              value={typeof value?.padding === 'number' ? value?.padding : 0}
              onChange={(v: number) => onChange && value?.margin && onChange({ ...value, padding: v })}
            />
          </div>
          <InputNumber
            className="col-4"
            min={0}
            value={value?.padding}
            onChange={(v?: string | number) => onChange && value?.margin && onChange({ ...value, padding: Number(v) })}
          />
        </div>

        <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.borderSpacing)}</StyledCraftSettingLabel>
        <div className="col-12 d-flex justify-content-center align-items-center mb-2 p-0">
          <div className="col-8 p-0">
            <StyledCraftSlider
              min={0}
              defaultValue={
                Array.from(new Set((value?.margin.m || '0;0;0;0').split(';'))).length > 1
                  ? Number(value?.margin.m)
                  : Number((value?.margin.m || '0;0;0;0')?.split(';')[0])
              }
              onChange={(v: number) =>
                onChange &&
                value?.margin &&
                onChange({
                  ...value,
                  margin: { m: `${v};${v};${v};${v}`, mt: `${v}`, mr: `${v}`, mb: `${v}`, ml: `${v}` },
                })
              }
            />
          </div>
          <Input
            className="col-4"
            min={0}
            value={value?.margin?.m}
            onChange={e => {
              onChange &&
                value?.margin &&
                onChange({
                  ...value,
                  margin: {
                    m: e.target.value || '0;0;0;0',
                    mt: e.target.value.split(';')[0],
                    mr: e.target.value.split(';')[1],
                    mb: e.target.value.split(';')[2],
                    ml: e.target.value.split(';')[3],
                  },
                })
            }}
          />
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default CraftBoxModelBlock
