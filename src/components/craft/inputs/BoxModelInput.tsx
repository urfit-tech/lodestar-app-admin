import { Input } from 'antd'
import { range, repeat } from 'ramda'
import React from 'react'
import { CraftSettingLabel, CraftSlider } from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'

const BoxModelInput: React.VFC<{
  title?: string // 3px 3px 3px 3px
  value?: string
  onChange?: (value: string) => void
}> = ({ title, value, onChange }) => {
  const boxModelValue = formatBoxModelValue(value)

  return (
    <>
      {title && <CraftSettingLabel>{title}</CraftSettingLabel>}
      <div className="col-12 d-flex justify-content-center align-items-center p-0">
        <div className="col-8 p-0">
          <CraftSlider
            min={0}
            value={new Set(boxModelValue).size === 1 ? Number(boxModelValue[0]) : 0}
            onChange={(v: number) =>
              onChange?.(
                `${repeat(v, 4)
                  .map(v => v + 'px')
                  .join(' ')}`,
              )
            }
          />
        </div>
        <Input
          className="col-4"
          value={boxModelValue.join(';')}
          onChange={e =>
            onChange?.(
              e.target.value
                .split(';')
                .map(v => v + 'px')
                .join(' '),
            )
          }
        />
      </div>
    </>
  )
}

export const formatBoxModelValue = (value?: string) => {
  const slices = value?.split(' ').map(v => v.replace('px', '')) || []
  return range(0, 4).map(index => Number(slices[index]) || 0)
}

export default BoxModelInput
