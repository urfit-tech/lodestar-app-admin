import { Button, Input } from 'antd'
import React, { forwardRef, useState } from 'react'
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

const AmountInput: React.FC<{
  value?: number
  onChange?: (value: number | undefined) => void
  onDecrease?: () => Promise<number>
  onIncrease?: () => Promise<number>
}> = ({ value, onChange, onDecrease, onIncrease }, ref) => {
  const [inputValue, setInputValue] = useState(`${value}`)

  return (
    <StyledInputGroup compact>
      <Button icon="minus" onClick={() => onDecrease && onDecrease().then(value => setInputValue(`${value}`))} />
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
      <Button icon="plus" onClick={() => onIncrease && onIncrease().then(value => setInputValue(`${value}`))} />
    </StyledInputGroup>
  )
}

export default forwardRef(AmountInput)
