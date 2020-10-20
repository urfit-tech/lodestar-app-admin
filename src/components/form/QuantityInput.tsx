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
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  value?: number
  min?: number
  max?: number
  onChange?: (value: number | undefined) => void
}> = ({ setInputValue, value = 0, min, max, onChange }) => {
  // const [inputValue, setInputValue] = useState(`${value}`)

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
          setInputValue(`${newValue}`)
        }}
      />
      <Input
        value={value}
        onChange={e => setInputValue(e.target.value)}
        onBlur={e => {
          const newValue = Number.isSafeInteger(parseInt(e.target.value)) ? parseInt(e.target.value) : value
          if ((typeof min === 'number' && newValue < min) || (typeof max === 'number' && newValue > max)) {
            setInputValue(`${value}`)
            return
          }
          setInputValue(`${newValue}`)
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
          setInputValue(`${newValue}`)
        }}
      />
    </StyledInputGroup>
  )
}

export default QuantityInput
