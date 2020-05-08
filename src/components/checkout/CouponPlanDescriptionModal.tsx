import { Modal, Typography } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { useCouponPlanCodeCollection } from '../../hooks/checkout'
import { CouponPlanProps } from '../../types/checkout'

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};
  .ant-modal-header {
    border-bottom: 0px solid #e8e8e8;
  }
  .ant-modal-title {
    font-weight: bold;
  }
  .ant-modal-body {
    padding: 0px 24px 24px;
    font-size: 14px;
  }
  .ant-modal-close-x {
    color: #9b9b9b;
  }
`
const StyledModalTitle = styled.div`
  font-weight: bold;
`
const StyledCouponCode = styled.span`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
`
const StyledDescription = styled.div`
  white-space: pre-wrap;
`

const CouponPlanDescriptionModal: React.FC<ModalProps & {
  couponPlan: CouponPlanProps
}> = ({ couponPlan, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { loadingCouponPlanCodes, errorCouponPlanCodes, couponPlanCodes } = useCouponPlanCodeCollection(couponPlan.id)

  return (
    <StyledModal title={couponPlan.title} footer={null} {...modalProps}>
      <StyledModalTitle className="mb-2">{formatMessage(promotionMessages.term.couponCode)}</StyledModalTitle>

      {loadingCouponPlanCodes
        ? formatMessage(commonMessages.event.loading)
        : errorCouponPlanCodes
        ? formatMessage(errorMessages.data.fetch)
        : couponPlanCodes.map(couponPlanCode => (
            <div key={couponPlanCode.id}>
              <StyledCouponCode className="mr-3">{couponPlanCode.code}</StyledCouponCode>
              <Typography.Text strong>
                {`${couponPlanCode.used}/${couponPlanCode.count} ${formatMessage(promotionMessages.label.unit)}`}
              </Typography.Text>
            </div>
          ))}

      <StyledDescription className="mt-4">{couponPlan.description}</StyledDescription>
    </StyledModal>
  )
}

export default CouponPlanDescriptionModal
