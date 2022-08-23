import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import React from 'react'
import styled from 'styled-components'

const StyledInputGroup = styled(Input.Group)`
  && {
    width: auto;
    input {
      width: 5rem;
      text-align: center;
    }
  }
`

const QuantityInput: React.FC<{
  value?: number
  min?: number
  max?: number
  onChange?: (value: number | undefined) => void
}> = ({ value = 0, min, max, onChange }) => {
  return (
    <StyledInputGroup compact>
      <Button
        icon={<MinusOutlined />}
        onClick={() => {
          const newValue = value - 1
          if (typeof min === 'number' && newValue < min) {
            return
          }
          onChange && onChange(newValue)
        }}
      />
      <Input
        value={value}
        onChange={e => {
          onChange && onChange(parseInt(e.target.value))
        }}
        onBlur={e => {
          const newValue = Number.isSafeInteger(parseInt(e.target.value)) ? parseInt(e.target.value) : value
          if ((typeof min === 'number' && newValue < min) || (typeof max === 'number' && newValue > max)) {
            onChange && onChange(value)
            return
          }
          onChange && onChange(newValue)
        }}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={() => {
          const newValue = value + 1
          if (typeof max === 'number' && newValue > max) {
            return
          }
          onChange && onChange(newValue)
        }}
      />
    </StyledInputGroup>
  )
}

export default QuantityInput
