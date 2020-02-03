import { Modal, Typography } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { InferType } from 'yup'
import { promotionMessages } from '../../helpers/translation'
import { couponSchema } from '../../schemas/coupon'
import { BraftContent } from '../common/StyledBraftEditor'

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};
  .ant-modal-header {
    border-bottom: 0px solid #e8e8e8;
    padding: 24px 24px;
  }
  .ant-modal-title {
    font-weight: bold;
  }
  .ant-modal-body {
    padding: 0px 24px 24px;
  }
  .ant-modal-close-x {
    color: #9b9b9b;
  }
`

const StyledHeading = styled(Typography.Text)`
  font-size: 14px;
  font-weight: bold;
`

const StyledCouponCode = styled.span`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
`

type CouponDescriptionModalProps = ModalProps & {
  coupon: InferType<typeof couponSchema>
}
const CouponDescriptionModal: React.FC<CouponDescriptionModalProps> = ({ coupon, ...modalProps }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledModal title={coupon.couponCode.couponPlan.title} footer={null} {...modalProps}>
      <div className="mb-2">
        <StyledHeading className="mr-2">{formatMessage(promotionMessages.term.couponCode)}</StyledHeading>
        <StyledCouponCode>{coupon.couponCode.code}</StyledCouponCode>
      </div>
      <div className="mt-4">
        <BraftContent>{coupon.couponCode.couponPlan.description}</BraftContent>
      </div>
    </StyledModal>
  )
}

export default CouponDescriptionModal
