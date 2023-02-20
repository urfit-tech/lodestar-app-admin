import { EditOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Divider, Tag } from 'antd'
import gql from 'graphql-tag'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useProductGiftPlan } from 'lodestar-app-element/src/hooks/giftPlan'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { ProgramPlan, ProgramPlanPeriodType } from '../../types/program'
import { AdminBlock, AdminBlockTitle } from '../admin'
import CountDownTimeBlock from '../common/CountDownTimeBlock'
import ProductSkuModal from '../common/ProductSkuModal'
import ProgramPlanAdminModal from './ProgramPlanAdminModal'

const messages = defineMessages({
  subscriptionCount: { id: 'program.text.subscriptionCount', defaultMessage: '{count} 人' },
})
const StyledCountDownBlock = styled.div`
  margin-top: 20px;
`

const StyledPriceBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .ant-tag {
    color: ${props => props.theme['@primary-color']};
    background-color: #fff;
    border: 1px solid ${props => props.theme['@primary-color']};
    border-radius: 4px;
  }
`

const ProgramSubscriptionPlanAdminCard: React.FC<{
  programId: string
  programPlan: ProgramPlan
  onRefetch?: () => void
}> = ({ programId, programPlan, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()
  const { salePrice, listPrice, discountDownPrice, periodType, periodAmount, currencyId } = programPlan
  const { loadingEnrollmentCount, enrollmentCount } = useProgramPlanEnrollmentCount(programPlan.id)
  const { productGiftPlan, refetchProductGiftPlan } = useProductGiftPlan(`ProgramPlan_${programPlan?.id}`)

  const isOnSale = (programPlan.soldAt?.getTime() || 0) > Date.now()
  const description = programPlan.description?.trim() || ''
  const programPlanType = programPlan.autoRenewed
    ? 'subscription'
    : programPlan.periodAmount && programPlan.periodType
    ? 'period'
    : 'perpetual'
  return (
    <AdminBlock>
      <AdminBlockTitle className="mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center" style={{ width: '90%' }}>
          <Tag className="mr-2">
            {programPlanType === 'subscription'
              ? formatMessage(commonMessages.ui.subscriptionPlan)
              : programPlanType === 'period'
              ? formatMessage(commonMessages.ui.periodPlan)
              : formatMessage(commonMessages.ui.perpetualPlan)}
          </Tag>
          {programPlan.title}
        </div>
        <ProgramPlanAdminModal
          onRefetch={onRefetch}
          onProductGiftPlanRefetch={refetchProductGiftPlan}
          programId={programId}
          programPlan={programPlan}
          productGiftPlan={productGiftPlan}
          renderTrigger={({ onOpen }) => (
            <div className="d-flex align-items-center">
              <EditOutlined
                onClick={() =>
                  onOpen?.(
                    programPlan.periodAmount && programPlan.periodType
                      ? programPlan.autoRenewed
                        ? 'subscription'
                        : 'period'
                      : 'perpetual',
                  )
                }
              />
            </div>
          )}
        />
      </AdminBlockTitle>
      <StyledPriceBlock>
        <PriceLabel
          listPrice={listPrice}
          salePrice={isOnSale ? salePrice : undefined}
          downPrice={discountDownPrice || undefined}
          periodAmount={periodAmount || 1}
          periodType={periodType as ProgramPlanPeriodType}
          currencyId={currencyId}
          variant="full-detail"
        />
        {!!enabledModules.gift &&
          (Boolean(permissions.GIFT_PLAN_ADMIN) || Boolean(permissions.GIFT_PLAN_NORMAL)) &&
          productGiftPlan.id && <Tag>{formatMessage(commonMessages.ui.hasGiftPlan)}</Tag>}
      </StyledPriceBlock>
      {programPlan.isCountdownTimerVisible && programPlan?.soldAt && isOnSale && (
        <StyledCountDownBlock>
          <CountDownTimeBlock expiredAt={programPlan?.soldAt} icon />
        </StyledCountDownBlock>
      )}
      <Divider />

      {description.length && (
        <div className="mb-3">
          <BraftContent>{description}</BraftContent>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          {!loadingEnrollmentCount && formatMessage(messages.subscriptionCount, { count: `${enrollmentCount}` })}
        </div>
        {enabledModules.sku && (
          <ProductSkuModal
            productId={`ProgramPlan_${programPlan.id}`}
            renderTrigger={({ onOpen, sku }) => (
              <Button type="link" onClick={() => onOpen?.()}>
                {sku
                  ? `${formatMessage(commonMessages.label.sku)}: ${sku}`
                  : formatMessage(commonMessages.label.skuSetting)}
              </Button>
            )}
          />
        )}
      </div>
    </AdminBlock>
  )
}

const useProgramPlanEnrollmentCount = (programPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT,
    hasura.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNTVariables
  >(
    gql`
      query GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT($programPlanId: uuid!) {
        program_plan_enrollment_aggregate(where: { program_plan_id: { _eq: $programPlanId } }) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { programPlanId } },
  )

  const enrollmentCount = data?.program_plan_enrollment_aggregate.aggregate?.count || 0

  return {
    loadingEnrollmentCount: loading,
    errorEnrollmentCount: error,
    enrollmentCount,
    refetchEnrollmentCount: refetch,
  }
}

export default ProgramSubscriptionPlanAdminCard
