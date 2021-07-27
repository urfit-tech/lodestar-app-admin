import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { StyleCircleColorInput, StyledCraftSettingLabel, StyledSketchPicker, StyledUnderLineInput } from '../admin'

const CraftColorPickerBlock: React.VFC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.color)}</StyledCraftSettingLabel>
      <StyledUnderLineInput
        className="mb-3"
        bordered={false}
        value={value}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onChange={e => onChange && onChange(e.target.value)}
      />

      <div className="d-flex mb-3">
        <StyleCircleColorInput background="#e1614b" onClick={() => onChange && onChange('#e1614b')} />
        <StyleCircleColorInput className="ml-2" background="#585858" onClick={() => onChange && onChange('#585858')} />
        <StyleCircleColorInput className="ml-2" background="#ffffff" onClick={() => onChange && onChange('#ffffff')} />
      </div>
      {visible && <StyledSketchPicker className="mb-3" color={value} onChange={e => onChange && onChange(e.hex)} />}
    </>
  )
}

export default CraftColorPickerBlock
