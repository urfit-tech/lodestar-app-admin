import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { craftPageMessages } from '../../helpers/translation'
import { StyleCircleColorInput, StyledCraftSettingLabel, StyledSketchPicker, StyledUnderLineInput } from '../admin'

const CraftColorPickerBlock: React.VFC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {
  const { settings } = useApp()
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)
  const sketchPickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sketchPickerRef.current && !sketchPickerRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sketchPickerRef])

  return (
    <>
      <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.color)}</StyledCraftSettingLabel>
      <StyledUnderLineInput
        className="mb-3"
        bordered={false}
        value={value}
        onClick={() => setVisible(true)}
        onChange={e => onChange?.(e.target.value)}
      />

      <div className="d-flex mb-3">
        <StyleCircleColorInput
          background={`${settings['theme.@primary-color']}`}
          onClick={() => onChange?.(`${settings['theme.@primary-color']}`)}
        />
        <StyleCircleColorInput className="ml-2" background="#585858" onClick={() => onChange?.('#585858')} />
        <StyleCircleColorInput className="ml-2" background="#ffffff" onClick={() => onChange?.('#ffffff')} />
      </div>
      {visible && (
        <div ref={sketchPickerRef}>
          <StyledSketchPicker className="mb-3" color={value} onChange={e => onChange?.(e.hex)} />
        </div>
      )}
    </>
  )
}

export default CraftColorPickerBlock
