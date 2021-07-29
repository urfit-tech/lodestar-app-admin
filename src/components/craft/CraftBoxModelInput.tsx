import { Input } from 'antd'
import React from 'react'
import { StyledCraftSettingLabel, StyledCraftSlider } from '../admin'

const CraftBoxModelInput: React.VFC<{
  title: String
  value?: String
  onChange?: (value?: String) => void
}> = ({ title, value, onChange }) => {
  return (
    <>
      <StyledCraftSettingLabel>{title}</StyledCraftSettingLabel>
      <div className="col-12 d-flex justify-content-center align-items-center mb-2 p-0">
        <>
          <div className="col-8 p-0">
            <StyledCraftSlider
              min={0}
              value={
                Array.from(
                  new Set([
                    Number(value?.split(';')[0]),
                    Number(value?.split(';')[1]),
                    Number(value?.split(';')[2]),
                    Number(value?.split(';')[3]),
                  ]),
                ).length > 1
                  ? 0
                  : Number(value?.split(';')[0] || 0)
              }
              onChange={(v: number) => onChange && onChange(`${v};${v};${v};${v};`)}
            />
          </div>
          <Input
            className="col-4"
            value={`${value?.split(';')[0]};${value?.split(';')[1]};${value?.split(';')[2]};${value?.split(';')[3]};`}
            onChange={e => {
              onChange &&
                onChange(
                  `${e.target.value?.split(';')[0]};${e.target.value?.split(';')[1]};${e.target.value?.split(';')[2]};${
                    e.target.value?.split(';')[3]
                  };`,
                )
            }}
          />
        </>
      </div>
    </>
  )
}

export default CraftBoxModelInput
