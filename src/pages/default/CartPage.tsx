import { Icon, Typography } from 'antd'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import CartProductTableCard from '../../components/checkout/CartProductTableCard'
import CheckoutCard from '../../components/checkout/CheckoutCard'
import DiscountSelectionCard from '../../components/checkout/DiscountSelectionCard'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { useCart } from '../../hooks/checkout'
import { Discount } from '../../types/payment'

const CartPage = () => {
  const { currentMemberId, setCurrentUserRole, isAuthenticated } = useAuth()
  const [discount, setDiscount] = useState<Discount>({ type: 'None', target: '' })
  const [checkData, setCheckData] = useState({
    order_discounts: [],
    order_products: [],
  })
  const { cartProducts } = useCart()

  useEffect(() => {
    isAuthenticated && setCurrentUserRole && setCurrentUserRole('general-member')
  }, [isAuthenticated, setCurrentUserRole])

  useEffect(() => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
        memberId: currentMemberId,
        productIds: cartProducts.map(cartProduct => cartProduct.productId),
        discount: discount.type === 'None' || !discount.target ? undefined : discount,
        checkoutOnly: true,
      })
      .then(({ data }) => {
        setCheckData({
          order_discounts: data.order_discounts || [],
          order_products: data.order_products || [],
        })
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
      })
  }, [JSON.stringify(cartProducts), JSON.stringify(discount), currentMemberId])

  return (
    <DefaultLayout>
      <div className="py-5">
        <div className="container">
          <Typography.Title level={3} className="mb-4">
            <Icon type="shopping-cart" className="mr-2" />
            <span>購物清單</span>
          </Typography.Title>
          {currentMemberId && (
            <>
              <div className="mb-3">
                <CartProductTableCard memberId={currentMemberId} />
              </div>

              {isAuthenticated && (
                <div className="mb-3">
                  <DiscountSelectionCard
                    memberId={currentMemberId}
                    check={
                      checkData && {
                        orderDiscounts: checkData.order_discounts,
                        orderProducts: checkData.order_products,
                      }
                    }
                    discount={discount}
                    onDiscountChange={setDiscount}
                  />
                </div>
              )}

              <div className="mb-3">
                <CheckoutCard
                  memberId={isAuthenticated ? currentMemberId : null}
                  check={
                    checkData && {
                      orderDiscounts: checkData.order_discounts,
                      orderProducts: checkData.order_products,
                    }
                  }
                  cartProducts={cartProducts}
                  discount={discount}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

export default CartPage
