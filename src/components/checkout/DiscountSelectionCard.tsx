import { Button, Divider, Radio } from 'antd'
import { CardProps } from 'antd/lib/card'
import { prop, propEq, sum } from 'ramda'
import React from 'react'
import styled from 'styled-components'
import { useEnrolledMembershipCardIds } from '../../hooks/card'
import { useCart } from '../../hooks/checkout'
import { Check, Discount } from '../../types/payment'
import AdminCard from '../common/AdminCard'
import CouponSelectionModal from './CouponSelectionModal'
import MembershipCardSelectionModal from './MembershipCardSelectionModal'

const StyledRadio = styled(Radio)`
  && {
    display: block;
    height: 3rem;
    line-height: 3rem;
  }
`

type DiscountSelectionCardProps = CardProps & {
  memberId: string
  isCheckoutSubscription?: boolean
  discount: Discount
  onDiscountChange: React.Dispatch<React.SetStateAction<Discount>>
  check?: Check
}
const DiscountSelectionCard: React.FC<DiscountSelectionCardProps> = ({
  memberId,
  isCheckoutSubscription,
  discount,
  onDiscountChange,
  check,
  ...cardProps
}) => {
  const { cartProducts } = useCart()
  const { enrolledMembershipCardIds } = useEnrolledMembershipCardIds(memberId)

  const priceWithDownPrice =
    check && check.orderProducts && check.orderDiscounts
      ? sum(check.orderProducts.map(prop('price'))) -
        sum(check.orderDiscounts.filter(propEq('type', 'DownPrice')).map(prop('price')))
      : 0

  return cartProducts.length || isCheckoutSubscription ? (
    <AdminCard {...cardProps}>
      <Radio.Group
        style={{ width: '100%' }}
        value={discount.type}
        onChange={e => onDiscountChange({ type: e.target.value, target: '' })}
      >
        <StyledRadio value="None">無折扣</StyledRadio>
        {/* {numPoints > 0 && (
          <>
            <Divider className="my-3" />
            <StyledRadio value="Point">使用點數折抵</StyledRadio>
          </>
        )} */}

        <Divider className="my-3" />

        <StyledRadio value="Coupon">
          <span className="mr-2">使用折價券</span>
          <span className="mr-2">
            {discount.type === 'Coupon' && (
              <CouponSelectionModal
                memberId={memberId}
                price={priceWithDownPrice}
                onSelect={coupon => {
                  onDiscountChange({ type: 'Coupon', target: coupon.id })
                }}
                render={({ setVisible, selectedCoupon }: any) => (
                  <>
                    <Button onClick={() => setVisible(true)}>{discount.target ? '重新選擇' : '選擇折價券'}</Button>
                    {selectedCoupon && <span className="ml-3">{selectedCoupon.couponCode.couponPlan.title}</span>}
                  </>
                )}
              />
            )}
          </span>
        </StyledRadio>

        {enrolledMembershipCardIds.length > 0 && (
          <>
            <Divider className="my-3" />
            <StyledRadio value="Card">
              <span className="mr-2">使用會員卡</span>
              <span className="mr-2">
                {discount.type === 'Card' && (
                  <MembershipCardSelectionModal
                    memberId={memberId}
                    onSelect={membershipCardId => {
                      onDiscountChange({ type: 'Card', target: membershipCardId })
                    }}
                    render={({ setVisible, selectedMembershipCard }: any) => (
                      <>
                        <Button onClick={() => setVisible(true)}>{discount.target ? '重新選擇' : '選擇會員卡'}</Button>
                        {selectedMembershipCard && <span className="ml-3">{selectedMembershipCard.title}</span>}
                      </>
                    )}
                  />
                )}
              </span>
            </StyledRadio>
          </>
        )}
      </Radio.Group>
    </AdminCard>
  ) : null
}

export default DiscountSelectionCard
