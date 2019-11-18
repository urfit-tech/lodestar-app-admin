import { Button, Icon } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import styled, { css } from 'styled-components'
import useRouter from 'use-react-router'
import { InferType } from 'yup'
import { useCart } from '../../hooks/data'
import { programSchema } from '../../schemas/program'

const StyleButton = styled(Button)<{ variant?: string }>`
  span {
    display: none;
  }

  ${props =>
    props.variant === 'multiline' &&
    css`
      order: 1;
      margin-top: 0.75rem;

      span {
        display: inline;
      }
    `}
`

type ProgramPaymentButtonProps = {
  memberId: string
  program: InferType<typeof programSchema>
  cartButtonProps?: ButtonProps
  orderButtonProps?: ButtonProps
  variant?: string
}
const ProgramPaymentButton: React.FC<ProgramPaymentButtonProps> = ({
  program,
  cartButtonProps,
  orderButtonProps,
  variant,
}) => {
  const { history } = useRouter()
  const { addCartProduct, findCartProduct } = useCart()
  const cartProduct = findCartProduct('Program', program.id)

  return program.isSoldOut ? (
    <Button block disabled>
      已售完
    </Button>
  ) : cartProduct ? (
    <Button block type="primary" onClick={() => history.push(`/cart`)}>
      前往購物車
    </Button>
  ) : (
    <div className={variant === 'multiline' ? 'd-flex flex-column' : 'd-flex'}>
      {program.listPrice !== 0 && (
        <StyleButton
          onClick={() => addCartProduct('Program', program.id)}
          className="mr-2"
          block={variant === 'multiline'}
          variant={variant}
          {...cartButtonProps}
        >
          <Icon type="shopping-cart" />
          <span className="ml-2">加入購物車</span>
        </StyleButton>
      )}

      <Button
        type="primary"
        block
        onClick={() => {
          addCartProduct('Program', program.id)
          history.push(`/cart`)
        }}
        {...orderButtonProps}
      >
        {program.listPrice !== 0 ? '立即購買' : '立即參與'}
      </Button>
    </div>
  )
}

export default ProgramPaymentButton
