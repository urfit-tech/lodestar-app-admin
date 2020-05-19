import { Button, Input } from 'antd'
import React, { useState } from 'react'
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
  onChange?: (value: number | undefined) => void
}> = ({ value = 0, onChange }, ref) => {
  const [inputValue, setInputValue] = useState(`${value}`)

  return (
    <StyledInputGroup compact>
      <Button
        icon="minus"
        onClick={() => {
          const newValue = value - 1
          onChange && onChange(newValue)
          setInputValue(`${newValue}`)
        }}
      />
      <Input
        ref={ref}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onBlur={e => {
          const newValue = Number.isSafeInteger(parseInt(e.target.value)) ? parseInt(e.target.value) : value
          setInputValue(`${newValue}`)
          onChange && onChange(newValue)
        }}
      />
      <Button
        icon="plus"
        onClick={() => {
          const newValue = value + 1
          onChange && onChange(newValue)
          setInputValue(`${newValue}`)
        }}
      />
    </StyledInputGroup>
  )
}

export default QuantityInput
