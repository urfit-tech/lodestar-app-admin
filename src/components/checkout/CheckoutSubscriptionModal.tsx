import { Button, Form, message, Modal } from 'antd'
import axios from 'axios'
import { prop, sum } from 'ramda'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactPixel from 'react-facebook-pixel'
import styled, { ThemeContext } from 'styled-components'
import useRouter from 'use-react-router'
import { InferType } from 'yup'
import DiscountSelectionCard from '../../components/checkout/DiscountSelectionCard'
import { useAuth } from '../../contexts/AuthContext'
import { currencyFormatter, getPeriodTypeLabel, handleError, TPDirect } from '../../helpers'
import { useMember } from '../../hooks/member'
import { useProgram } from '../../hooks/program'
import { programPlanSchema } from '../../schemas/program'
import settings from '../../settings'
import { Check, Discount } from '../../types/payment'
import { AuthModalContext } from '../auth/AuthModal'

const StyledDiv = styled.div`
  height: 44px;
  width: 100%;
  border-radius: 4px;
  border: solid 1px #cdcdcd;
  padding: 0 12px;
`
const StyledModal = styled(Modal)`
  && {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 0;
    width: 100%;
    max-width: initial;
    padding: 0;
    @media (min-height: 900px) {
      height: 100%;
    }
  }
  .ant-modal-content {
    height: 100%;
  }
`
const ModalTitle = styled.h2`
  letter-spacing: 0.8px;
  font-size: 18px;
  font-weight: bold;
  color: #585858;
`
const ModalContainer = styled.div`
  margin: 40px auto;
  max-width: 620px;
  width: 100%;
  line-height: 1;
`
const ProgramContainer = styled.div``
const ProgramInfo = styled.div``
const ProgramTitle = styled.h3`
  letter-spacing: 0.77px;
  font-weight: bold;
  font-size: 20px;
  font-weight: bold;
  color: #585858;
`
const ProgramPlanTitle = styled.h4`
  margin-bottom: 16px;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
`
const ProgramPlanPrice = styled.div`
  line-height: 1.5;
  letter-spacing: 0.2px;
  font-size: 16px;
  font-weight: bold;
  color: #10bad9;
  p {
    margin-bottom: 0;
  }
`
const ButtonGroup = styled.div`
  text-align: right;
`
const FixedRatioImage = styled.div<{ src?: string }>`
  background-size: cover;
  background-position: center;
`

type CheckoutSubscriptionModalProps = {
  render: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
  }>
  programId: string
  programPlan: InferType<typeof programPlanSchema>
  isFundingProgram?: boolean
}
const CheckoutSubscriptionModal: React.FC<CheckoutSubscriptionModalProps> = ({
  render,
  programId,
  programPlan,
  isFundingProgram,
  ...props
}) => {
  const theme = useContext(ThemeContext)
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)
  const { history } = useRouter()
  const { currentMemberId, isAuthenticated } = useAuth()
  const { program } = useProgram(programId)
  const { member } = useMember(currentMemberId || '')

  const [check, setCheck] = useState<Check>()
  const [visible, setVisible] = useState()
  const [loading, setLoading] = useState()
  const [discount, setDiscount] = useState<Discount>({ type: 'None', target: '' })
  const isNoticeShow =
    check && !(sum(check.orderProducts.map(prop('price'))) - sum(check.orderDiscounts.map(prop('price'))))

  const cardNoRef = useRef(null)
  const cardExpRef = useRef(null)

  const isOnSale = programPlan.soldAt && new Date() < programPlan.soldAt
  const price = isOnSale ? programPlan.salePrice : programPlan.listPrice
  const hasFirstDiscount = Boolean(programPlan.discountDownPrice)
  const priceWithFirstDiscount = price - programPlan.discountDownPrice

  const handleCheckout = () => {
    setLoading(true)
    settings.trackingId.fbPixel && ReactPixel.track('InitiateCheckout', { value: price, currency: 'TWD' })
    TPDirect.card.getPrime((result: any) => {
      if (result.status !== 0) {
        message.error(`信用卡資料錯誤`)
        setLoading(false)
        return
      }
      if (!isAuthenticated) {
        setAuthModalVisible && setAuthModalVisible(true)
      } else if (member) {
        axios
          .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
            memberId: member.id,
            productIds: [`ProgramPlan_${programPlan.id}`],
            discount: discount.type === 'None' || !discount.target ? undefined : discount,
          })
          .then(({ data }) => {
            const orderId = data.id
            return axios
              .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/paySubscribedOrder`, {
                orderId,
                options: {
                  prime: result.card.prime,
                  cardholder: {
                    phone_number: '+886987654321',
                    name: member.name,
                    email: member.email,
                  },
                },
              })
              .then(() => {
                settings.trackingId.fbPixel && ReactPixel.track('Purchase', { value: price, currency: 'TWD' })
                isFundingProgram
                  ? history.push(`/members/${currentMemberId}?tabkey=funding`)
                  : history.push(`/programs/${programId}/contents`)
              })
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      }
    })
  }

  useEffect(() => {
    visible &&
      !cardNoRef.current &&
      !cardExpRef.current &&
      setTimeout(() => {
        TPDirect.card.setup({
          fields: {
            number: {
              // css selector
              element: cardNoRef.current,
              placeholder: '**** **** **** ****',
            },
            expirationDate: {
              // DOM object
              element: cardExpRef.current,
              placeholder: 'MM / YY',
            },
          },
        })
      })
  }, [visible])

  return (
    <>
      {render && render({ setVisible })}

      <StyledModal
        {...props}
        visible={visible}
        confirmLoading={loading}
        footer={null}
        width={'100%'}
        onCancel={() => setVisible(false)}
      >
        <ModalTitle>購買項目</ModalTitle>
        <ModalContainer>
          <ProgramContainer className="d-flex justify-content-between">
            <ProgramInfo>
              <ProgramTitle>{program && program.title}</ProgramTitle>
              <ProgramPlanTitle>{programPlan.title}</ProgramPlanTitle>
              <ProgramPlanPrice style={{ color: theme['@primary-color'] }}>
                {hasFirstDiscount && (
                  <p>
                    首期
                    <span>
                      {currencyFormatter(priceWithFirstDiscount)}/{getPeriodTypeLabel(programPlan.periodType)}
                    </span>
                  </p>
                )}
                <p>
                  {hasFirstDiscount && '第二期開始'}
                  <span>
                    {currencyFormatter(isOnSale ? programPlan.salePrice : programPlan.listPrice)}/
                    {getPeriodTypeLabel(programPlan.periodType)}
                  </span>
                </p>
              </ProgramPlanPrice>
            </ProgramInfo>
            {program && (
              <FixedRatioImage
                style={{
                  backgroundImage: `url(${(program && program.coverUrl) || ''})`,
                  width: '88px',
                  height: '60px',
                }}
              />
            )}
          </ProgramContainer>
          <div>
            {currentMemberId && (
              <DiscountSelectionCard
                style={{ marginTop: '40px' }}
                memberId={currentMemberId}
                isCheckoutSubscription={true}
                discount={discount}
                onDiscountChange={setDiscount}
                check={check}
              />
            )}
            {isNoticeShow && (
              <p style={{ marginTop: '20px', color: '#9b9b9b', fontSize: '12px' }}>
                若訂閱金額為 NT$0 時，系統皆會酌收 NT$1 的驗證手續費
              </p>
            )}
            <Form style={{ marginTop: '40px' }}>
              <Form.Item className="mb-1" label="卡號" required>
                <StyledDiv ref={cardNoRef} />
              </Form.Item>
              <Form.Item className="mb-1" label="有效期" required>
                <StyledDiv ref={cardExpRef} />
              </Form.Item>
            </Form>
          </div>
          {programPlan && currentMemberId && (
            <CheckoutBlock
              programPlan={programPlan}
              hasFirstDiscount={hasFirstDiscount}
              onCheckout={handleCheckout}
              onVisible={setVisible}
              discount={discount}
              memberId={currentMemberId}
              loading={loading}
              onCheckSet={setCheck}
            />
          )}
        </ModalContainer>
      </StyledModal>
    </>
  )
}

type CheckoutBlockProp = {
  memberId: string
  discount: Discount
  hasFirstDiscount: boolean
  loading: boolean
  programPlan: InferType<typeof programPlanSchema>
  onCheckout: () => void
  onCheckSet: (check: Check) => void
  onVisible: (value: boolean) => void
}

const CheckoutPrice = styled.div`
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #585858;
`

const CheckoutDiscount = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  letter-spacing: 0.2px;
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme['@primary-color']};
`

const CheckoutBlock: React.FC<CheckoutBlockProp> = ({
  memberId,
  discount,
  programPlan,
  onCheckout,
  onVisible,
  onCheckSet,
  loading,
}) => {
  let [check, setCheck] = useState<Check>()
  useEffect(() => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
        memberId,
        productIds: [`ProgramPlan_${programPlan.id}`],
        discount: discount.type === 'None' || !discount.target ? undefined : discount,
        checkoutOnly: true,
      })
      .then(({ data }) => {
        const check: Check = {
          orderProducts: data.order_products.map((value: any) => ({
            name: value.name,
            description: value.description,
            price: value.price,
            endedAt: value.ended_at,
            startedAt: value.started_at,
            autoRenewed: value.auto_renewed,
          })),
          orderDiscounts: data.order_discounts.map((value: any) => ({
            name: value.name,
            description: value.description,
            price: value.price,
            target: value.target,
            type: value.type,
          })),
        }
        setCheck(check)
        onCheckSet(check)
      })
      .catch(handleError)
  }, [programPlan, JSON.stringify(discount), memberId])
  return (
    <>
      <div style={{ marginTop: '40px' }}>
        {check &&
          check.orderProducts.map((orderProduct: { name: string; description: string; price: number }, idx: number) => {
            return (
              <CheckoutPrice key={idx} className="d-flex justify-content-between">
                <p>{orderProduct.name}</p>
                <p>{check && currencyFormatter(orderProduct.price)}</p>
              </CheckoutPrice>
            )
          })}

        {check &&
          check.orderDiscounts.map(
            (orderDiscount: { name: string; description: string; price: number }, idx: number) => {
              return (
                <CheckoutPrice key={idx} className="d-flex justify-content-between">
                  <div>{orderDiscount.name}</div>
                  <div>- {orderDiscount.price}</div>
                </CheckoutPrice>
              )
            },
          )}
        <CheckoutDiscount>
          <p>
            {check &&
              currencyFormatter(
                sum(check.orderProducts.map(prop('price'))) - sum(check.orderDiscounts.map(prop('price'))),
              )}
          </p>
        </CheckoutDiscount>
      </div>
      <ButtonGroup>
        <Button onClick={() => onVisible(false)} style={{ marginRight: '12px' }}>
          返回
        </Button>
        <Button onClick={onCheckout} type="primary" loading={loading}>
          立即訂閱
        </Button>
      </ButtonGroup>
    </>
  )
}

export default CheckoutSubscriptionModal
