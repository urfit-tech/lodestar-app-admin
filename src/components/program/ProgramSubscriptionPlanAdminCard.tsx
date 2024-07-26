import { EditOutlined } from '@ant-design/icons'
import { Button, Divider, Tag } from 'antd'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useProductGiftPlan } from 'lodestar-app-element/src/hooks/giftPlan'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { useProductChannelInfo } from '../../hooks/channel'
import { useMembershipCardByTargetId, useProgramPlanEnrollmentCount } from '../../hooks/programPlan'
import { ProgramPlan, ProgramPlanPeriodType } from '../../types/program'
import { AdminBlock, AdminBlockTitle } from '../admin'
import CountDownTimeBlock from '../common/CountDownTimeBlock'
import ProductSkuModal from '../common/ProductSkuModal'
import ProgramPlanModal from './programPlanAdminModals/ProgramPlanModal'

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
  const { id: appId, enabledModules, settings } = useApp()
  const { permissions, currentUserRole } = useAuth()
  const {
    salePrice,
    listPrice,
    discountDownPrice,
    periodType,
    periodAmount,
    currencyId,
    listPricePrefix,
    listPriceSuffix,
    salePricePrefix,
    salePriceSuffix,
  } = programPlan
  const { loadingEnrollmentCount, enrollmentCount } = useProgramPlanEnrollmentCount(programPlan.id)
  const { productGiftPlan, refetchProductGiftPlan } = useProductGiftPlan(`ProgramPlan_${programPlan?.id}`)
  const { productChannelInfo, refetchProductChannelInfo } = useProductChannelInfo(
    appId,
    `ProgramPlan_${programPlan?.id}`,
  )
  const { cardTitle, cardProducts } = useMembershipCardByTargetId('ProgramPlan', programPlan.id)
  const [isOpen, setIsOpen] = useState(false)
  const hasMembershipCardPermission = enabledModules.membership_card && currentUserRole === 'app-owner'

  const isOnSale = (programPlan.soldAt?.getTime() || 0) > Date.now()
  const description = programPlan.description?.trim() || ''
  const programPlanType = programPlan.autoRenewed
    ? 'subscription'
    : programPlan.periodAmount && programPlan.periodType
    ? 'period'
    : cardProducts.length !== 0
    ? 'membership'
    : 'perpetual'

  if (programPlanType === 'membership' && !hasMembershipCardPermission) {
    return null
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
            <div className="d-flex align-items-center">
              <EditOutlined onClick={() => setIsOpen(true)} />
            </div>
            {isOpen && (
              <ProgramPlanModal
                programPlanType={programPlanType}
                programId={programId}
                programPlan={programPlan}
                productGiftPlan={productGiftPlan}
                onRefetch={onRefetch}
                refetchProductGiftPlan={refetchProductGiftPlan}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            )}
          </AdminBlockTitle>
          <StyledMemberShipBlock>
            {formatMessage(commonMessages.text.displayMembershipCard, { membershipCard: cardTitle })}
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
            <div className="d-flex align-items-center">
              <EditOutlined onClick={() => setIsOpen(true)} />
            </div>
            {isOpen && (
              <ProgramPlanModal
                programPlanType={programPlanType}
                programId={programId}
                programPlan={programPlan}
                productGiftPlan={productGiftPlan}
                onRefetch={onRefetch}
                refetchProductGiftPlan={refetchProductGiftPlan}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            )}
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
              affix={
                settings['program.layout_template_circumfix.enabled']
                  ? { listPricePrefix, listPriceSuffix, salePricePrefix, salePriceSuffix }
                  : undefined
              }
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

export default ProgramSubscriptionPlanAdminCard
