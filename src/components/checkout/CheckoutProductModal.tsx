import { Button, Form, Input, message, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import axios from 'axios'
import { History } from 'history'
import { prop, sum } from 'ramda'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactPixel from 'react-facebook-pixel'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import ProductItem from '../../containers/common/ProductItem'
import { currencyFormatter, handleError, TPDirect } from '../../helpers'
import { useMember } from '../../hooks/data'
import { Member } from '../../schemas/general'
import settings from '../../settings'
import { Check, Discount } from '../../types/payment'
import { useAuth } from '../auth/AuthContext'
import { AuthModalContext } from '../auth/AuthModal'
import DiscountSelectionCard from './DiscountSelectionCard'

const StyledModal = styled(Modal)`
  && {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;

    .ant-modal-content {
      min-height: 100vh;
    }
  }
`
const StyledTitle = styled.h1`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledWrapper = styled.div`
  margin: 0 auto;
  max-width: 40rem;
`
const StyledWarningText = styled.p`
  margin-top: 1.25rem;
  color: var(--gray-dark);
  font-size: 12px;
`
const StyledInputTarget = styled.div`
  padding: 0 12px;
  height: 44px;
  width: 100%;
  border-radius: 4px;
  border: solid 1px #cdcdcd;
`
const StyledCheckoutBlock = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;

  > div {
    margin-bottom: 0.75rem;

    > span:first-child {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`
const StyledCheckoutPrice = styled.div`
  color: ${props => props.theme['@primary-color']};
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
  text-align: right;
`

type CheckoutProductModalProps = FormComponentProps &
  ModalProps & {
    renderTrigger: React.FC<{
      setVisible: React.Dispatch<React.SetStateAction<boolean>>
    }>
    type: 'perpetual' | 'subscription'
    productId: string
    requiredFields?: ('name' | 'email' | 'phone')[]
  }
const CheckoutProductModal: React.FC<CheckoutProductModalProps> = ({
  children,
  form,
  renderTrigger,
  type,
  productId,
  requiredFields,
  ...Modalprops
}) => {
  const { history } = useRouter()
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)
  const { currentMemberId, isAuthenticated } = useAuth()
  const { member } = useMember(currentMemberId || '')

  const cardNoRef = useRef<HTMLDivElement | null>(null)
  const cardExpRef = useRef<HTMLDivElement | null>(null)

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [check, setCheck] = useState<Check>()
  const [discount, setDiscount] = useState<Discount>({ type: 'None', target: '' })

  const originalProductPrice = !!check ? sum(check.orderProducts.map(prop('price'))) : 0
  const totalPrice = !!check
    ? sum(check.orderProducts.map(prop('price'))) - sum(check.orderDiscounts.map(prop('price')))
    : 0

  useEffect(() => {
    if (type !== 'subscription' || !visible || cardNoRef.current || cardExpRef.current) {
      return
    }

    setTimeout(() => {
      TPDirect.card.setup({
        fields: {
          number: {
            element: cardNoRef.current,
            placeholder: '**** **** **** ****',
          },
          expirationDate: {
            element: cardExpRef.current,
            placeholder: 'MM / YY',
          },
        },
      })
    })
  }, [type, visible])

  useEffect(() => {
    onDiscountChange(currentMemberId, productId, discount, setCheck)
  }, [JSON.stringify(discount), currentMemberId])

  const handleCheckout = async () => {
    if (!isAuthenticated || !member) {
      setAuthModalVisible && setAuthModalVisible(true)
      return
    }

    switch (type) {
      case 'subscription':
        checkoutSubscription(setLoading, history, {
          member,
          productId,
          discount,
          price: originalProductPrice,
        })
        break
      case 'perpetual':
        form.validateFields((error, values) => {
          if (error) {
            return
          }

          checkoutPerpretual(setLoading, {
            member,
            productId,
            discount,
            price: totalPrice,
            name: values.name,
            email: values.email,
            phone: values.phone,
          })
        })
        break
    }
  }

  return (
    <>
      {renderTrigger({ setVisible })}

      <StyledModal
        title={null}
        footer={null}
        width="100%"
        destroyOnClose
        visible={visible}
        onCancel={() => setVisible(false)}
        {...Modalprops}
      >
        <StyledTitle className="mb-4">購物清單</StyledTitle>

        <StyledWrapper>
          <div className="mb-5">
            <ProductItem id={productId} variant="checkout" />
          </div>

          {currentMemberId && (
            <div className="mb-3">
              <DiscountSelectionCard
                memberId={currentMemberId}
                isCheckoutSubscription={true}
                discount={discount}
                onDiscountChange={setDiscount}
                check={check}
              />
            </div>
          )}

          {totalPrice === 0 && (
            <StyledWarningText className="mb-5">若訂閱金額為 NT$0 時，系統皆會酌收 NT$1 的驗證手續費</StyledWarningText>
          )}
          {!!requiredFields && requiredFields.length > 0 && (
            <StyledWarningText>請留下你的真實聯絡資訊，以利入場身份核對與確保獲得場次的最新消息。</StyledWarningText>
          )}

          <Form className={`mb-5 ${type === 'subscription' ? 'd-block' : 'd-none'}`}>
            <Form.Item className="mb-1" label="卡號" required>
              <StyledInputTarget ref={cardNoRef} />
            </Form.Item>
            <Form.Item className="mb-1" label="有效期" required>
              <StyledInputTarget ref={cardExpRef} />
            </Form.Item>
          </Form>

          <Form className={`mb-5 ${!!requiredFields && requiredFields.length ? 'd-block' : 'd-none'}`}>
            <Form.Item
              label="姓名"
              className={!!requiredFields && requiredFields.includes('name') ? 'd-block' : 'd-none'}
            >
              {form.getFieldDecorator('name', {
                rules: [{ required: !!requiredFields && requiredFields.includes('name'), message: '請輸入姓名' }],
                initialValue: member ? member.name : '',
              })(<Input />)}
            </Form.Item>
            <Form.Item
              label="聯絡信箱"
              className={!!requiredFields && requiredFields.includes('email') ? 'd-block' : 'd-none'}
            >
              {form.getFieldDecorator('email', {
                rules: [{ required: !!requiredFields && requiredFields.includes('email'), message: '請輸入信箱' }],
                initialValue: member ? member.email : '',
              })(<Input />)}
            </Form.Item>
            <Form.Item
              label="手機"
              className={!!requiredFields && requiredFields.includes('phone') ? 'd-block' : 'd-none'}
            >
              {form.getFieldDecorator('phone', {
                rules: [{ required: !!requiredFields && requiredFields.includes('phone'), message: '請輸入手機' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
          </Form>

          {check && (
            <StyledCheckoutBlock className="mb-4">
              {check.orderProducts.map(orderProduct => (
                <div key={orderProduct.name} className="d-flex align-items-center justify-content-between">
                  <span className="flex-grow-1 mr-4">{orderProduct.name}</span>
                  <span className="flex-shrink-0">{currencyFormatter(orderProduct.price)}</span>
                </div>
              ))}

              {check.orderDiscounts.map(orderDiscount => (
                <div key={orderDiscount.name} className="d-flex align-items-center justify-content-between">
                  <span className="flex-grow-1 mr-4">{orderDiscount.name}</span>
                  <span className="flex-shrink-0">-{currencyFormatter(orderDiscount.price)}</span>
                </div>
              ))}
            </StyledCheckoutBlock>
          )}

          <StyledCheckoutPrice className="mb-3">{currencyFormatter(totalPrice)}</StyledCheckoutPrice>

          <div className="text-right">
            <Button onClick={() => setVisible(false)} className="mr-3">
              取消
            </Button>
            <Button type="primary" loading={loading} onClick={() => handleCheckout()}>
              {type === 'subscription' ? '立即訂閱' : '立即購買'}
            </Button>
          </div>
        </StyledWrapper>
      </StyledModal>
    </>
  )
}

const onDiscountChange: (
  currentMemberId: string | undefined,
  productId: string,
  discount: Discount,
  setCheck: React.Dispatch<any>,
) => void = (currentMemberId, productId, discount, setCheck) => {
  axios
    .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
      memberId: currentMemberId || '',
      productIds: [productId],
      discount: discount.type === 'None' || !discount.target ? undefined : discount,
      checkoutOnly: true,
    })
    .then(({ data }) => {
      setCheck({
        orderProducts: data.order_products,
        orderDiscounts: data.order_discounts,
      })
    })
    .catch(error => {
      message.error(error.response.data.message)
    })
}

const checkoutSubscription: (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  history: History<any>,
  data: {
    member: Member
    productId: string
    discount: Discount
    price: number
  },
) => Promise<void> = async (setLoading, history, { member, discount, productId, price }) => {
  TPDirect.card.getPrime(async (result: any) => {
    if (result.status !== 0) {
      message.error(`信用卡資料錯誤`)
      return
    }

    setLoading(true)

    settings.trackingId.fbPixel &&
      ReactPixel.track('InitiateCheckout', {
        value: price,
        currency: 'TWD',
      })

    let orderLogId: string

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
        memberId: member.id,
        productIds: [productId],
        discount: discount.type === 'None' || !discount.target ? undefined : discount,
      })

      orderLogId = data.id

      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/paySubscribedOrder`, {
          orderId: orderLogId,
          options: {
            prime: result.card.prime,
            cardholder: {
              phone_number: '+886987654321',
              name: member.name,
              email: member.email,
            },
          },
        })

        settings.trackingId.fbPixel && ReactPixel.track('Purchase', { value: price, currency: 'TWD' })

        const productType = productId.split('_')[0]
        switch (productType) {
          case 'ProjectPlan':
            history.push(`/members/${member.id}?tabkey=project-plan`)
            break
          default:
            history.push(`/members/${member.id}`)
        }
      } catch (error) {
        handleError(error)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  })
}

const checkoutPerpretual: (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  data: {
    member: Member
    productId: string
    discount: Discount
    price: number
    name?: string
    email?: string
    phone?: string
  },
) => Promise<void> = async (setLoading, { member, productId, discount, price, name, email, phone }) => {
  setLoading(true)

  settings.trackingId.fbPixel &&
    ReactPixel.track('AddPaymentInfo', {
      value: price,
      currency: 'TWD',
    })

  let orderLogId: string

  try {
    const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
      memberId: member.id,
      productIds: [productId],
      discount: discount.type === 'None' || !discount.target ? undefined : discount,
      invoice: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
    })

    orderLogId = data.id

    const clientBackUrl = window.location.origin

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/getPayForm`, {
        orderId: orderLogId,
        options: {
          notifyUrl: `${process.env.REACT_APP_BACKEND_ENDPOINT}/handleOrderNotification`,
          clientBackUrl,
          returnUrl: `${process.env.REACT_APP_BACKEND_ENDPOINT}/payment-proxy`,
        },
      })

      data.payFormHtml ? document.write(data.payFormHtml) : window.location.assign(clientBackUrl)
    } catch (error) {
      handleError(error)
    }
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(false)
  }
}

export default Form.create<CheckoutProductModalProps>()(CheckoutProductModal)
