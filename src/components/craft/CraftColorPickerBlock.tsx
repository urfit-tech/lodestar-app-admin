import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { StyleCircleColorInput, StyledCraftSettingLabel, StyledSketchPicker, StyledUnderLineInput } from '../admin'

const CraftColorPickerBlock: React.VFC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.color)}</StyledCraftSettingLabel>
      <StyledUnderLineInput className="mb-3" bordered={false} value={value} />
      <div className="d-flex mb-3">
        <StyleCircleColorInput background="#e1614b" onClick={() => onChange && onChange('#e1614b')} />
        <StyleCircleColorInput className="ml-2" background="#585858" onClick={() => onChange && onChange('#585858')} />
        <StyleCircleColorInput className="ml-2" background="#ffffff" onClick={() => onChange && onChange('#ffffff')} />
      </div>
      <StyledSketchPicker className="mb-3" color={value} onChange={e => onChange && onChange(e.hex)} />
    </>
  )
}

export default CraftColorPickerBlock
