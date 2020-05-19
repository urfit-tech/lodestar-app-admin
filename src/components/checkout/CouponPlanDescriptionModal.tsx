import { Button, Modal, Typography } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { useCouponCodeCollection } from '../../hooks/checkout'
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
const StyledCouponCode = styled.span`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
`
const StyledDescription = styled.div`
  white-space: pre-wrap;
`

const CouponPlanDescriptionModal: React.FC<
  ModalProps & {
    couponPlan: CouponPlanProps
  }
> = ({ couponPlan, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { loadingCouponCodes, errorCouponCodes, couponCodes } = useCouponCodeCollection(couponPlan.id)

  const exportCodes = () => {
    const data: string[][] = [
      [formatMessage(promotionMessages.term.couponCodes), formatMessage(promotionMessages.status.used), 'Email'],
    ]

    couponCodes.forEach(couponPlanCode => {
      couponPlanCode.coupons.forEach(coupon => {
        data.push([couponPlanCode.code, coupon.used ? 'v' : '', coupon.member.email])
      })

      if (couponPlanCode.remaining) {
        for (let i = 0; i < couponPlanCode.remaining; i++) {
          data.push([couponPlanCode.code, '', ''])
        }
      }
    })

    downloadCSV(`${couponPlan.title}.csv`, toCSV(data))
  }

  return (
    <StyledModal title={couponPlan.title} footer={null} {...modalProps}>
      <Button type="primary" icon="download" className="mb-4" onClick={() => exportCodes()}>
        {formatMessage(promotionMessages.ui.exportCodes)}
      </Button>

      {loadingCouponCodes ? (
        <div>{formatMessage(commonMessages.event.loading)}</div>
      ) : errorCouponCodes ? (
        <div>{formatMessage(errorMessages.data.fetch)}</div>
      ) : (
        couponCodes.map(couponPlanCode => (
          <div key={couponPlanCode.id}>
            <StyledCouponCode className="mr-3">{couponPlanCode.code}</StyledCouponCode>
            <Typography.Text strong>
              {`${couponPlanCode.used}/${couponPlanCode.count} ${formatMessage(promotionMessages.label.unit)}`}
            </Typography.Text>
          </div>
        ))
      )}

      <StyledDescription className="mt-4">{couponPlan.description}</StyledDescription>
    </StyledModal>
  )
}

export default CouponPlanDescriptionModal
