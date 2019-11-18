import { Badge, Button, List, Popover, Typography } from 'antd'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { currencyFormatter } from '../../helpers'
import { useProduct } from '../../hooks/data'
import EmptyCover from '../../images/default/empty-cover.png'
import { CartProduct } from '../../types/payment'
import { CustomRatioImage } from '../common/Image'

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

type CartDropdownProps = {
  memberId: string
  cartProducts: Array<CartProduct>
}

const CartDropdown: React.FC<CartDropdownProps> = ({ memberId, cartProducts }) => {
  const { history } = useRouter()
  const [dropdownProducts, setDropdownProducts] = useState<CartProduct[]>([])

  useEffect(() => {
    onCartProductsChange(memberId, cartProducts, setDropdownProducts)
  }, [JSON.stringify(cartProducts)])

  const content = (
    <Wrapper>
      <StyledList itemLayout="horizontal">
        {dropdownProducts.map(dropdownProduct =>
          dropdownProduct.product_id ? (
            <CartProductListItem
              key={dropdownProduct.id}
              productId={dropdownProduct.product_id}
              productPrice={dropdownProduct.price}
            />
          ) : (
            <div key={dropdownProduct.id}>目前無此銷售產品</div>
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

  return dropdownProducts.length ? (
    <Popover placement="bottomRight" trigger="click" title="購物清單" content={content}>
      <StyledBadge count={dropdownProducts.length} className="mr-2">
        <StyledButton type="link" icon="shopping-cart" />
      </StyledBadge>
    </Popover>
  ) : null
}

const CartProductListItem: React.FC<{
  productId: string
  productPrice?: number
}> = ({ productId, productPrice }) => {
  const [productType, targetId] = productId.split('_')
  const { product } = useProduct(productType, targetId)

  return (
    <StyledListItem>
      {/* <Link to={product && product.fundingId ? `/projects/${product.fundingId}` : `/programs/${productId}`}> */}
      <List.Item.Meta
        className="align-items-center"
        avatar={<CustomRatioImage width="4rem" ratio={2 / 3} src={(product && product.cover_url) || EmptyCover} />}
        title={
          <Typography.Paragraph ellipsis={{ rows: 2 }} className="m-0">
            {product && product.title}
          </Typography.Paragraph>
        }
        description={<span>{currencyFormatter(productPrice)}</span>}
      />
      {/* </Link> */}
    </StyledListItem>
  )
}

const onCartProductsChange: (
  memberId: string,
  cartProducts: Array<CartProduct>,
  setDropdownProducts: React.Dispatch<React.SetStateAction<CartProduct[]>>,
) => void = (memberId, cartProducts, setDropdownProducts) => {
  axios
    .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
      memberId,
      productIds: cartProducts.map(cartProduct => cartProduct.product_id),
      checkoutOnly: true,
    })
    .then(({ data }) => {
      setDropdownProducts(
        cartProducts.map((cartProduct, i) => {
          return { ...cartProduct, ...data.order_products[i] }
        }),
      )
    })
    .catch(error => {
      console.log(error.message)
    })
}

export default CartDropdown
