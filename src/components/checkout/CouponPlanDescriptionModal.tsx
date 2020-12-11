import { Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'
import styled from 'styled-components'
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
    font-size: 14px;
    line-height: 1.57;
    letter-spacing: 0.18px;
    color: var(--gray-darker);
  }
  .ant-modal-close-x {
    color: #9b9b9b;
  }
`
const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`

const CouponPlanDescriptionModal: React.FC<
  {
    couponPlan: CouponPlanProps & { productIds: string[] }
    renderContent?: () => React.ReactNode
  } & ModalProps
> = ({ couponPlan, renderContent, ...modalProps }) => {
  return (
    <StyledModal title={null} footer={null} {...modalProps}>
      <StyledModalTitle className="mb-3">{couponPlan.title}</StyledModalTitle>
      {renderContent?.()}
    </StyledModal>
  )
}

export default CouponPlanDescriptionModal
