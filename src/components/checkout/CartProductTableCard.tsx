import { Icon, List } from 'antd'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { Link } from 'react-router-dom'
import ProductItem from '../../containers/common/ProductItem'
import { useCart } from '../../hooks/data'
import AdminCard from '../common/AdminCard'

type CartProductTableCardProps = CardProps & {
  memberId: string
}
const CartProductTableCard: React.FC<CartProductTableCardProps> = ({ memberId, ...cardProps }) => {
  const { cartProducts, removeCartProduct } = useCart()
  return (
    <AdminCard {...cardProps}>
      {cartProducts.length === 0 && (
        <div>
          <span>購物車沒有東西</span>
          <Link to="/programs">來去逛逛</Link>
        </div>
      )}
      <List itemLayout="horizontal">
        {cartProducts.map(
          cartProduct =>
            cartProduct.product_id && (
              <div
                key={cartProduct.id}
                className="d-flex justify-content-between align-items-center"
                style={{ marginBottom: '10px' }}
              >
                <ProductItem id={cartProduct.product_id} />
                <Icon type="close" onClick={() => removeCartProduct(cartProduct.id)} />
              </div>
            ),
        )}
      </List>
    </AdminCard>
  )
}

export default CartProductTableCard
