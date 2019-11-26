import { Badge, Button, List, Popover } from 'antd'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import ProductItem from '../../containers/common/ProductItem'
import { useCart } from '../../hooks/checkout'
import { CartProduct } from '../../types/payment'

const Wrapper = styled.div`
  width: 100vw;
  max-width: 320px;
`
const StyledList = styled(List)`
  && {
    max-height: calc(70vh - 57px - 42px);
    overflow-y: auto;
    overflow-x: hidden;
  }
`
const StyledListItem = styled(List.Item)`
  && {
    padding: 12px;
    cursor: pointer;
  }
`
const StyledAction = styled.div`
  border-top: 1px solid #ececec;

  button {
    color: #9b9b9b;
  }
`
const StyledBadge = styled(Badge)`
  button {
    font-size: 20px;
  }

  .ant-badge-count {
    top: 8px;
    right: 4px;
  }
`
const StyledButton = styled(Button)`
  &&,
  &&:hover,
  &&:active,
  &&:focus {
    color: var(--gray-darker);
  }
`

const CartDropdown: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { history } = useRouter()

  const { cartProducts } = useCart()

  const [cartProductCollection, setCartProductCollection] = useState<CartProduct[]>([])

  useEffect(() => {
    if (cartProducts.length) {
      axios
        .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
          memberId,
          productIds: cartProducts.map(cartProduct => cartProduct.productId),
          checkoutOnly: true,
        })
        .then(({ data }) => {
          setCartProductCollection(
            cartProducts.map((cartProduct, i) => ({
              id: cartProduct.id,
              productId: cartProduct.productId,
              createdAt: cartProduct.createdAt,
              price: data.order_products[i].price,
            })),
          )
        })
        .catch(error => {
          process.env.NODE_ENV === 'development' && console.error(error)
        })
    }
  }, [cartProducts.length])

  if (cartProductCollection.length === 0) {
    return null
  }

  const content = (
    <Wrapper>
      <StyledList itemLayout="horizontal">
        {cartProductCollection.map(cartProduct =>
          cartProduct.productId ? (
            <CartProductListItem
              key={cartProduct.id}
              productId={cartProduct.productId}
              productPrice={cartProduct.price}
            />
          ) : (
            <div key={cartProduct.id}>目前無此銷售產品</div>
          ),
        )}
      </StyledList>
      <StyledAction>
        <Button type="link" block onClick={() => history.push('/cart')}>
          查看清單
        </Button>
      </StyledAction>
    </Wrapper>
  )

  return (
    <Popover placement="bottomRight" trigger="click" title="購物清單" content={content}>
      <StyledBadge count={cartProductCollection.length} className="mr-2">
        <StyledButton type="link" icon="shopping-cart" />
      </StyledBadge>
    </Popover>
  )
}

const CartProductListItem: React.FC<{
  productId: string
  productPrice?: number
}> = ({ productId, productPrice }) => {
  return (
    <StyledListItem>
      <ProductItem id={productId} variant="cartItem" />
      {/* <span>{currencyFormatter(productPrice)}</span> */}
    </StyledListItem>
  )
}

export default CartDropdown
