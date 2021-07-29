import { Input } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { craftPageMessages } from '../../helpers/translation'
import { CraftMarginProps, CraftPaddingProps } from '../../types/craft'
import { StyledCraftSettingLabel, StyledCraftSlider } from '../admin'

const StyledWarning = styled.div`
  color: #ff4d4f;
  font-size: 14px;
`

const CraftBoxModelInput: React.VFC<{
  edgeType: 'padding' | 'margin'
  value?: CraftPaddingProps & CraftMarginProps
  onChange?: (value?: CraftPaddingProps & CraftMarginProps) => void
}> = ({ edgeType, value, onChange }) => {
  const { formatMessage } = useIntl()
  const [match, setMatch] = useState(true)

  return (
    <>
      <StyledCraftSettingLabel>
        {edgeType === 'padding'
          ? formatMessage(craftPageMessages.label.boundary)
          : edgeType === 'margin'
          ? formatMessage(craftPageMessages.label.borderSpacing)
          : ''}
      </StyledCraftSettingLabel>
      <div className="col-12 d-flex justify-content-center align-items-center mb-2 p-0">
        {edgeType === 'padding' && (
          <>
            <div className="col-8 p-0">
              <StyledCraftSlider
                min={0}
                value={
                  Array.from(new Set([Number(value?.pt), Number(value?.pr), Number(value?.pb), Number(value?.pl)]))
                    .length > 1
                    ? 0
                    : Number(value?.pt || 0)
                }
                onChange={(v: number) =>
                  onChange &&
                  onChange({
                    pt: `${v}`,
                    pr: `${v}`,
                    pb: `${v}`,
                    pl: `${v}`,
                  })
                }
              />
            </div>
            <Input
              className="col-4"
              value={`${value?.pt};${value?.pr};${value?.pb};${value?.pl};`}
              onChange={e => {
                if (e.target.value.match(/[0-9]+\;[0-9]+\;[0-9]+\;[0-9]+\;/) === null) {
                  setMatch(false)
                } else {
                  setMatch(true)
                }
                onChange &&
                  onChange({
                    pt: e.target.value.split(';')[0],
                    pr: e.target.value.split(';')[1],
                    pb: e.target.value.split(';')[2],
                    pl: e.target.value.split(';')[3],
                  })
              }}
            />
          </>
        )}
        {edgeType === 'margin' && (
          <>
            <div className="col-8 p-0">
              <StyledCraftSlider
                min={0}
                value={
                  Array.from(new Set([Number(value?.mt), Number(value?.mr), Number(value?.mb), Number(value?.ml)]))
                    .length > 1
                    ? 0
                    : Number(value?.m || 0)
                }
                onChange={(v: number) => onChange && onChange({ mt: `${v}`, mr: `${v}`, mb: `${v}`, ml: `${v}` })}
              />
            </div>
            <Input
              className="col-4"
              min={0}
              value={`${value?.mt};${value?.mr};${value?.mb};${value?.ml};`}
              onChange={e => {
                if (e.target.value.match(/[0-9]+\;[0-9]+\;[0-9]+\;[0-9]+\;/) === null) {
                  setMatch(false)
                } else {
                  setMatch(true)
                }
                onChange &&
                  onChange({
                    mt: e.target.value.split(';')[0],
                    mr: e.target.value.split(';')[1],
                    mb: e.target.value.split(';')[2],
                    ml: e.target.value.split(';')[3],
                  })
              }}
            />
          </>
        )}
      </div>
      {!match && <StyledWarning>{formatMessage(craftPageMessages.text.boxModelInputWarning)}</StyledWarning>}
    </>
  )
}

export default CraftBoxModelInput
