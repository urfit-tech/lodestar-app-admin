import { Button, Divider, Input, message, Modal, Spin } from 'antd'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { ProductType } from 'lodestar-app-element/src/types/product'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { useCouponCollection } from '../../hooks/coupon'
import { CouponProps, OrderDiscountProps, OrderProductProps } from '../../types/checkout'
import CouponCard from './CouponCard'
import couponMessages from './translation'

const CouponSelectionModal: React.FC<{
  memberId: string
  orderProducts: OrderProductProps[]
  orderDiscounts: OrderDiscountProps[]
  onSelect?: (coupon: CouponProps) => void
  render?: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    selectedCoupon?: CouponProps
  }>
  withAddCoupon?: boolean
}> = ({ memberId, orderProducts, orderDiscounts, onSelect, render, withAddCoupon }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { data: coupons, loading: loadingCoupons, fetch: refetchCoupons } = useCouponCollection(memberId)

  const [code, setCode] = useState('')
  const [visible, setVisible] = useState(false)
  const [inserting, setInserting] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponProps>()

  const handleCouponInsert = () => {
    setInserting(true)
    axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/payment/exchange`,
        {
          code,
          type: 'Coupon',
        },
        {
          headers: { authorization: `Bearer ${authToken}` },
        },
      )
      .then(({ data }) => {
        if (data.code === 'SUCCESS') {
          refetchCoupons()
          setCode('')
          message.success(formatMessage(couponMessages.CouponSelectionModal.addSuccessfully))
        } else {
          message.error(formatMessage(couponMessages.CouponSelectionModal.addFailed))
        }
      })
      .catch(handleError)
      .finally(() => setInserting(false))
  }

  return (
    <>
      {render && render({ setVisible, selectedCoupon })}

      <Modal
        title={formatMessage(couponMessages.CouponSelectionModal.chooseCoupon)}
        footer={null}
        onCancel={() => setVisible(false)}
        visible={visible}
      >
        {loadingCoupons ? (
          <Spin />
        ) : (
          coupons
            .filter(coupon => !coupon.status?.outdated && !coupon.status?.used)
            .map(coupon => {
              const couponPlanScope = coupon.couponCode?.couponPlan.scope
              const couponPlanProductIds = coupon.couponCode?.couponPlan.productIds || []
              const isInCouponScope = (productId: string) => {
                const [productType] = productId.split('_')
                return (
                  couponPlanScope === null ||
                  couponPlanScope?.includes(productType as ProductType) ||
                  couponPlanProductIds.includes(productId)
                )
              }

              const filteredOrderProducts = orderProducts.filter(orderProduct =>
                isInCouponScope(orderProduct.productId),
              )
              const filteredOrderDiscounts = orderDiscounts.filter(orderDiscount => orderDiscount.type === 'DownPrice')
              const price =
                sum(filteredOrderProducts.map(orderProduct => orderProduct.price)) -
                sum(filteredOrderDiscounts.map(orderDiscount => orderDiscount.price))

              return coupon.couponCode?.couponPlan.constraint || 0 <= price ? (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onClick={() => {
                    onSelect && onSelect(coupon)
                    setSelectedCoupon(coupon)
                    setVisible(false)
                  }}
                  style={{ cursor: 'pointer', marginBottom: '12px' }}
                />
              ) : (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  style={{ userSelect: 'none', cursor: 'not-allowed', marginBottom: '12px', color: '#9b9b9b' }}
                />
              )
            })
        )}
        {withAddCoupon && (
          <>
            <Divider>{formatMessage(couponMessages.CouponSelectionModal.or)}</Divider>
            <div className="d-flex">
              <div className="flex-grow-1">
                <Input
                  style={{ borderRadius: '4px 0px 0px 4px' }}
                  placeholder={formatMessage(couponMessages.CouponSelectionModal.enter)}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
              <Button
                block
                type="primary"
                style={{ width: '72px', borderRadius: '0px 4px 4px 0px' }}
                loading={inserting}
                onClick={handleCouponInsert}
              >
                {formatMessage(couponMessages.CouponSelectionModal.add)}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

export default CouponSelectionModal
