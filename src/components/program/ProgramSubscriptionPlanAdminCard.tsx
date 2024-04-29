import { EditOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, Divider, Tag } from 'antd'
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
import { useProductChannelInfo } from '../../hooks/channel'
import { ProgramPlan, ProgramPlanPeriodType } from '../../types/program'
import { AdminBlock, AdminBlockTitle } from '../admin'
import CountDownTimeBlock from '../common/CountDownTimeBlock'
import ProductSkuModal from '../common/ProductSkuModal'
import {
  MembershipPlanModal,
  PeriodPlanModal,
  PerpetualPlanModal,
  SubscriptionPlanModal,
} from './programPlanAdminModals'
import { GET_CARD_TITLE_BY_ID } from './programPlanAdminModals/formItem/MembershipCardItem'

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

const StyledModalButton = styled(Button)`
  padding: 0;
  height: fit-content;

  span: {
    margin: 0;
  }
`

const StyledMemberShipBlock = styled.span`
  width: 292px;
  height: 20px;
  margin: 16px 0 24px;
  font-family: NotoSansCJKtc;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
  word-wrap: break-word;
`

const ProgramSubscriptionPlanAdminCard: React.FC<{
  programId: string
  programPlan: ProgramPlan
  onRefetch?: () => void
}> = ({ programId, programPlan, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()
  const { permissions } = useAuth()
  const { salePrice, listPrice, discountDownPrice, periodType, periodAmount, currencyId } = programPlan
  const { loadingEnrollmentCount, enrollmentCount } = useProgramPlanEnrollmentCount(programPlan.id)
  const { productGiftPlan, refetchProductGiftPlan } = useProductGiftPlan(`ProgramPlan_${programPlan?.id}`)
  const { productChannelInfo, refetchProductChannelInfo } = useProductChannelInfo(
    appId,
    `ProgramPlan_${programPlan?.id}`,
  )
  const { loading: loadingById, data: dataById } = useQuery(GET_CARD_TITLE_BY_ID, {
    variables: { id: programPlan.card_id },
  })

  const isOnSale = (programPlan.soldAt?.getTime() || 0) > Date.now()
  const description = programPlan.description?.trim() || ''
  const programPlanType = programPlan.autoRenewed
    ? 'subscription'
    : programPlan.periodAmount && programPlan.periodType
    ? 'period'
    : programPlan.card_id
    ? 'membership'
    : 'perpetual'

  const ProgramPlanModal: React.FC = () => {
    switch (programPlanType) {
      case 'perpetual':
        return (
          <PerpetualPlanModal
            onRefetch={onRefetch}
            onProductGiftPlanRefetch={refetchProductGiftPlan}
            programId={programId}
            programPlan={programPlan}
            productGiftPlan={productGiftPlan}
            renderTrigger={({ onOpen }) => (
              <div className="d-flex align-items-center">
                <EditOutlined onClick={() => onOpen?.()} />
              </div>
            )}
          />
        )

      case 'period':
        return (
          <PeriodPlanModal
            onRefetch={onRefetch}
            onProductGiftPlanRefetch={refetchProductGiftPlan}
            programId={programId}
            programPlan={programPlan}
            productGiftPlan={productGiftPlan}
            renderTrigger={({ onOpen }) => (
              <div className="d-flex align-items-center">
                <EditOutlined onClick={() => onOpen?.()} />
              </div>
            )}
          />
        )

      case 'subscription':
        return (
          <SubscriptionPlanModal
            onRefetch={onRefetch}
            onProductGiftPlanRefetch={refetchProductGiftPlan}
            programId={programId}
            programPlan={programPlan}
            productGiftPlan={productGiftPlan}
            renderTrigger={({ onOpen }) => (
              <div className="d-flex align-items-center">
                <EditOutlined onClick={() => onOpen?.()} />
              </div>
            )}
          />
        )

      case 'membership':
        return (
          <MembershipPlanModal
            onRefetch={onRefetch}
            onProductGiftPlanRefetch={refetchProductGiftPlan}
            programId={programId}
            programPlan={programPlan}
            renderTrigger={({ onOpen }) => (
              <div className="d-flex align-items-center">
                <EditOutlined onClick={() => onOpen?.()} />
              </div>
            )}
          />
        )

      default:
        return <></>
    }
  }

  return (
    <AdminBlock>
      {programPlanType === 'membership' ? (
        <>
          <AdminBlockTitle className="mb-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center" style={{ width: '90%' }}>
              <Tag className="mr-2">{formatMessage(commonMessages.ui.membershipPlan)}</Tag>
              {programPlan.title}
            </div>
            <ProgramPlanModal />
          </AdminBlockTitle>
          <StyledMemberShipBlock>
            {!loadingById &&
              formatMessage(commonMessages.text.displayMembershipCard, { membershipCard: dataById?.card[0].title })}
          </StyledMemberShipBlock>
        </>
      ) : (
        <>
          <AdminBlockTitle className="mb-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center" style={{ width: '90%' }}>
              <Tag className="mr-2">
                {programPlanType === 'subscription'
                  ? formatMessage(commonMessages.ui.subscriptionPlan)
                  : programPlanType === 'period'
                  ? formatMessage(commonMessages.ui.periodPlan)
                  : programPlanType === 'perpetual'
                  ? formatMessage(commonMessages.ui.perpetualPlan)
                  : formatMessage(commonMessages.ui.membershipPlan)}
              </Tag>
              {programPlan.title}
            </div>
            <ProgramPlanModal />
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

          <div className="d-flex align-items-end justify-content-between">
            {enabledModules.sku ? (
              <ProductSkuModal
                className="flex-grow-1"
                productId={`ProgramPlan_${programPlan.id}`}
                renderTrigger={({ onOpen, sku }) => (
                  <div className="d-flex flex-column align-items-start">
                    <StyledModalButton type="link" onClick={() => onOpen?.()}>
                      {!sku &&
                        productChannelInfo?.filter(v => v.channelSku).length === 0 &&
                        formatMessage(commonMessages.label.skuSetting)}
                      {sku && `${formatMessage(commonMessages.label.sku)}: ${sku}`}
                    </StyledModalButton>

                    {productChannelInfo &&
                      productChannelInfo
                        ?.filter(v => v.channelSku)
                        ?.map(v => (
                          <StyledModalButton
                            key={v.appChannelId}
                            type="link"
                            onClick={() => onOpen?.()}
                          >{`${v.appChannelName}: ${v.channelSku}`}</StyledModalButton>
                        ))}
                  </div>
                )}
                onRefetch={() => refetchProductChannelInfo()}
              />
            ) : (
              <div></div>
            )}
            <div>
              {!loadingEnrollmentCount && formatMessage(messages.subscriptionCount, { count: `${enrollmentCount}` })}
            </div>
          </div>
        </>
      )}
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
