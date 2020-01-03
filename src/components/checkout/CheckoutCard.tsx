import { Button, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import axios from 'axios'
import { prop, sum } from 'ramda'
import React, { useContext, useState } from 'react'
import ReactPixel from 'react-facebook-pixel'
import { ThemeContext } from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { currencyFormatter } from '../../helpers'
import settings from '../../settings'
import { CartProduct, Check, Discount } from '../../types/payment'
import AdminCard from '../admin/AdminCard'
import { AuthModalContext } from '../auth/AuthModal'

type CheckoutCardProps = CardProps & {
  memberId: string | null
  discount: Discount
  check: Check
  cartProducts: CartProduct[]
}
const CheckoutCard: React.FC<CheckoutCardProps> = ({ memberId, discount, check, cartProducts, ...cardProps }) => {
  const theme = useContext(ThemeContext)
  const { isAuthenticated } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState()

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setVisible && setVisible(true)
      return
    }
    setLoading(true)
    // tracking add payment info event
    settings.trackingId.fbPixel &&
      ReactPixel.track('AddPaymentInfo', {
        value: check ? sum(check.orderProducts.map(prop('price'))) - sum(check.orderDiscounts.map(prop('price'))) : 0,
        currency: 'TWD',
      })
    let orderId: string
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
        memberId,
        productIds: cartProducts.map(cartProduct => cartProduct.productId),
        discount: discount.type === 'None' || !discount.target ? undefined : discount,
      })
      orderId = data.id
    } catch (error) {
      message.error(error.message)
      return
    }
    const clientBackUrl = window.location.origin
    axios
      .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/getPayForm`, {
        orderId,
        options: {
          notifyUrl: `${process.env.REACT_APP_BACKEND_ENDPOINT}/handleOrderNotification`,
          clientBackUrl,
          returnUrl: `${process.env.REACT_APP_BACKEND_ENDPOINT}/payment-proxy`,
        },
      })
      .then(({ data }) => {
        data.payFormHtml ? document.write(data.payFormHtml) : window.location.assign(clientBackUrl)
      })
      .catch(error => {
        message.error(error.message)
      })
      .finally(() => setLoading(false))
  }

  return (
    <AdminCard {...cardProps} loading={!check}>
      {check &&
        check.orderProducts &&
        check.orderProducts.map((orderProduct, idx) => (
          <div key={idx} className="row mb-2">
            <div className="col-6 offset-md-4 col-md-4">
              <span>{orderProduct.name}</span>
            </div>
            <div className="col-6 col-md-4 d-flex justify-content-end align-self-end">NT$ {orderProduct.price}</div>
          </div>
        ))}
      {check &&
        check.orderDiscounts &&
        check.orderDiscounts.map((orderDiscount, idx) => (
          <div key={idx} className="row">
            <div className="col-10 offset-md-4 col-md-6">
              <span>{orderDiscount.name}</span>
            </div>
            <div className="col-2 col-md-2 d-flex justify-content-end align-self-end">- NT$ {orderDiscount.price}</div>
          </div>
        ))}
      {check && check.orderProducts && check.orderDiscounts && (
        <div className="row mb-3 mt-5">
          <div
            className="col-12 offset-md-8 col-md-4"
            style={{
              fontSize: '24px',
              textAlign: 'right',
              color: theme['@primary-color'],
            }}
          >
            {`共 ${currencyFormatter(
              sum(check.orderProducts.map(prop('price'))) - sum(check.orderDiscounts.map(prop('price'))),
            )}`}
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-12 offset-md-8 col-md-4 offset-lg-10 col-lg-2">
          <Button block type="primary" onClick={handleCheckout} loading={loading}>
            前往結帳
          </Button>
        </div>
      </div>
    </AdminCard>
  )
}

export default CheckoutCard
