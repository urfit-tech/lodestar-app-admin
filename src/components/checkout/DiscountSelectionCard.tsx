import { Button, Radio } from 'antd'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { checkoutMessages } from '../../helpers/translation'
import { useEnrolledMembershipCardIds } from '../../hooks/card'
import { CheckProps } from '../../types/checkout'
import { AuthModalContext } from '../auth/AuthModal'
import CouponSelectionModal from '../coupon/CouponSelectionModal'
import MembershipCardSelectionModal from './MembershipCardSelectionModal'

const StyledRadio = styled(Radio)`
  && {
    display: block;
    height: 3rem;
    line-height: 3rem;
  }
`

const DiscountSelectionCard: React.FC<{
  value?: string | null
  memberId?: string | null
  check?: CheckProps
  onChange?: (discountId: string) => void
  withAddDiscount?: boolean
}> = ({ value: discountId, memberId, check, onChange, withAddDiscount }) => {
  const { formatMessage } = useIntl()
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)
  const { enrolledMembershipCardIds } = useEnrolledMembershipCardIds(memberId || '')

  const [discountType, discountTarget] = discountId?.split('_') || [null, null]

  return (
    <Radio.Group
      style={{ width: '100%' }}
      value={discountType || 'None'}
      onChange={e => onChange && onChange(e.target.value)}
    >
      <StyledRadio value="None">{formatMessage(checkoutMessages.form.radio.noDiscount)}</StyledRadio>
      <StyledRadio value="Coupon">
        <span>{formatMessage(checkoutMessages.form.radio.useCoupon)}</span>
        {discountType === 'Coupon' && (
          <span className="ml-2">
            {memberId ? (
              <CouponSelectionModal
                memberId={memberId}
                orderProducts={check?.orderProducts || []}
                orderDiscounts={check?.orderDiscounts || []}
                onSelect={coupon => {
                  onChange && onChange(`Coupon_${coupon.id}`)
                }}
                render={({ setVisible, selectedCoupon }) => (
                  <>
                    <Button onClick={() => setVisible(true)}>
                      {discountTarget
                        ? formatMessage(checkoutMessages.form.radio.reselectCoupon)
                        : formatMessage(checkoutMessages.form.radio.chooseCoupon)}
                    </Button>
                    {selectedCoupon && <span className="ml-3">{selectedCoupon.couponCode?.couponPlan.title}</span>}
                  </>
                )}
                withAddCoupon={withAddDiscount}
              />
            ) : (
              <Button onClick={() => setAuthModalVisible && setAuthModalVisible(true)}>
                {formatMessage(checkoutMessages.form.radio.chooseCoupon)}
              </Button>
            )}
          </span>
        )}
      </StyledRadio>
      <StyledRadio value="Coin">{formatMessage(checkoutMessages.form.radio.useCoupon)}</StyledRadio>
      {enrolledMembershipCardIds.length > 0 && (
        <StyledRadio value="Card">
          <span>{formatMessage(checkoutMessages.content.useMemberCard)}</span>
          {discountType === 'Card' && (
            <span className="ml-2">
              {memberId ? (
                <MembershipCardSelectionModal
                  memberId={memberId}
                  onSelect={membershipCardId => {
                    onChange && onChange(`Card_${membershipCardId}`)
                  }}
                  render={({ setVisible, selectedMembershipCard }: any) => (
                    <>
                      <Button onClick={() => setVisible(true)}>
                        {discountTarget
                          ? formatMessage(checkoutMessages.form.radio.reselectCoupon)
                          : formatMessage(checkoutMessages.title.chooseMemberCard)}
                      </Button>
                      {selectedMembershipCard && <span className="ml-3">{selectedMembershipCard.title}</span>}
                    </>
                  )}
                />
              ) : null}
            </span>
          )}
        </StyledRadio>
      )}
    </Radio.Group>
  )
}

export default DiscountSelectionCard
