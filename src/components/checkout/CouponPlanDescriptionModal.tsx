import { useQuery } from '@apollo/react-hooks'
import { Modal, Typography } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { InferType } from 'yup'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { couponPlanSchema } from '../../schemas/coupon'
import types from '../../types'

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

type CouponPlanDescriptionModalProps = ModalProps & {
  couponPlan: InferType<typeof couponPlanSchema>
}
const CouponPlanDescriptionModal: React.FC<CouponPlanDescriptionModalProps> = ({ couponPlan, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { loading, data, error } = useQuery<types.GET_COUPON_PLAN_CODES, types.GET_COUPON_PLAN_CODESVariables>(
    GET_COUPON_PLAN_CODES,
    {
      variables: { couponPlanId: couponPlan.id },
    },
  )

  return (
    <StyledModal title={couponPlan.title} footer={null} {...modalProps}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{formatMessage(promotionMessages.term.couponCode)}</div>

      {loading
        ? formatMessage(commonMessages.event.loading)
        : error || !data
        ? formatMessage(errorMessages.data.fetch)
        : data.coupon_code.map((codeValue: any) => (
            <div key={codeValue.code}>
              <StyledCouponCode className="mr-3">{codeValue.code}</StyledCouponCode>
              <Typography.Text strong>
                {`${codeValue.coupons_aggregate.aggregate.count}/${codeValue.count} ${formatMessage(
                  promotionMessages.label.unit,
                )}`}
              </Typography.Text>
            </div>
          ))}

      <StyledDescription className="mt-4">{couponPlan.description}</StyledDescription>
    </StyledModal>
  )
}

const GET_COUPON_PLAN_CODES = gql`
  query GET_COUPON_PLAN_CODES($couponPlanId: uuid!) {
    coupon_code(where: { coupon_plan: { id: { _eq: $couponPlanId } } }) {
      code
      count
      coupons_aggregate {
        aggregate {
          count
        }
      }
      #   coupons_aggregate(where: { order_logs: { status: { _eq: "SUCCESS" } } }) {
      #     aggregate {
      #       count
      #     }
      #   }
    }
  }
`

export default CouponPlanDescriptionModal
