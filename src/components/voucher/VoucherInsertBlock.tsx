import { Button, Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../common/Responsive'

const StyledWrapper = styled.div`
  padding: 1.5rem;
  border-radius: 4px;
  background: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAK_POINT}px) {
    padding: 2rem 10rem;
  }
`
const StyledTitle = styled.div`
  font-size: 14px;
  color: var(--gray-darker);
`
const StyledInput = styled(Input)`
  && {
    margin-bottom: 1.25rem;
    width: 100%;

    @media (min-width: ${BREAK_POINT}px) {
      margin-bottom: 0;
      margin-right: 0.75rem;
      width: auto;
    }
  }
`
const StyledButton = styled(Button)`
  && {
    width: 100%;

    @media (min-width: ${BREAK_POINT}px) {
      width: auto;
    }
  }
`

type VoucherInsertBlockProps = FormComponentProps & {
  onInsert?: (setLoading: React.Dispatch<React.SetStateAction<boolean>>, code: string) => void
}
const VoucherInsertBlock: React.FC<VoucherInsertBlockProps> = ({ form, onInsert }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    form.validateFields((err, values) => {
      if (err) {
        return
      }

      if (onInsert) {
        onInsert(setLoading, values.code)
      }
    })
  }

  return (
    <StyledWrapper>
      <StyledTitle className="mb-2">新增兌換券</StyledTitle>

      <Form layout="inline" onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          {form.getFieldDecorator('code', { rules: [{ required: true, message: null }] })(
            <StyledInput placeholder="輸入兌換碼" className="flex-grow-1" autoComplete="off" />,
          )}
          <StyledButton loading={loading} type="primary" htmlType="submit" disabled={!form.getFieldValue('code')}>
            新增
          </StyledButton>
        </div>
      </Form>
    </StyledWrapper>
  )
}

export default Form.create<VoucherInsertBlockProps>()(VoucherInsertBlock)
