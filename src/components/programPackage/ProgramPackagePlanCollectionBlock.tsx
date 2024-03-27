import { EditOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Divider, Tag } from 'antd'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages, commonMessages as helperCommonMessages } from '../../helpers/translation'
import { useProductChannelInfo } from '../../hooks/channel'
import { ProgramPackagePlanProps } from '../../types/programPackage'
import ProductSkuModal from '../common/ProductSkuModal'
import ProgramPackagePlanAdminModal from './ProgramPackagePlanAdminModal'
import programPackageMessages from './translation'

const messages = defineMessages({
  people: { id: 'programPackage.label.people', defaultMessage: '人' },
  availableForLimitTime: { id: 'programPackage.label.availableForLimitTime', defaultMessage: '可觀看 {amount} {unit}' },
})

const StyledCard = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
`
const StyledTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const StyledEnrollment = styled.div`
  color: var(--black-45);
  text-align: right;
  font-size: 14px;
  letter-spacing: 0.18px;
`
const StyledText = styled.span`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
`

const StyledModalButton = styled(Button)`
  padding: 0;
  height: fit-content;

  span: {
    margin: 0;
  }
`

const ProgramPackagePlanCollectionBlock: React.FC<{
  programPackageId: string
  plans: ProgramPackagePlanProps[]
  onRefetch?: () => void
}> = ({ programPackageId, plans, onRefetch }) => {
  const [updatePosition] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION,
    hasura.UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION)

  return (
    <div className="row py-5">
      {plans.map(plan => (
        <div key={plan.id} className="col-12 col-md-6 mb-4">
          <ProgramPackagePlanCard programPackageId={programPackageId} onRefetch={onRefetch} {...plan} />
        </div>
      ))}
    </div>
  )
}

const StyledLabel = styled.div<{ active?: boolean }>`
  position: relative;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;

  &::before {
    display: block;
    position: absolute;
    top: 5px;
    left: -18px;
    width: 10px;
    height: 10px;
    background-color: ${props => (props.active ? 'var(--success)' : 'var(--gray)')};
    content: '';
    border-radius: 50%;
  }
`
const ProgramPackagePlanCard: React.FC<ProgramPackagePlanProps & { programPackageId: string; onRefetch?: () => void }> =
  ({
    programPackageId,
    id,
    title,
    listPrice,
    salePrice,
    soldAt,
    discountDownPrice,
    description,
    soldQuantity,
    isSubscription,
    periodAmount,
    periodType,
    publishedAt,
    isTempoDelivery,
    isParticipantsVisible,
    position,
    remindPeriodAmount,
    remindPeriodType,
    onRefetch,
  }) => {
    const { formatMessage } = useIntl()
    const { id: appId, enabledModules } = useApp()
    const { productChannelInfo, refetchProductChannelInfo } = useProductChannelInfo(appId, `ProgramPackagePlan_${id}`)
    const isOnSale = soldAt && soldAt.getTime() > Date.now()
    const status =
      publishedAt && Date.now() > publishedAt.getTime()
        ? formatMessage(commonMessages.status.selling)
        : formatMessage(commonMessages.status.notSold)

    const programPackagePlanType = isSubscription ? 'subscription' : periodAmount && periodType ? 'period' : 'perpetual'

    return (
      <StyledCard>
        <StyledTitle className="mb-3 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <Tag className="mr-2">
              {programPackagePlanType === 'subscription'
                ? formatMessage(commonMessages.ui.subscriptionPlan)
                : programPackagePlanType === 'period'
                ? formatMessage(commonMessages.ui.periodPlan)
                : formatMessage(commonMessages.ui.perpetualPlan)}
            </Tag>
            {title}
          </div>
          <ProgramPackagePlanAdminModal
            programPackageId={programPackageId}
            onRefetch={onRefetch}
            plan={{
              id,
              title,
              listPrice,
              salePrice,
              soldAt,
              discountDownPrice,
              description,
              soldQuantity,
              isSubscription,
              periodType,
              periodAmount,
              publishedAt,
              isTempoDelivery,
              isParticipantsVisible,
              position,
              remindPeriodAmount,
              remindPeriodType,
            }}
            title={formatMessage(programPackageMessages.ProgramPackagePlanCollectionBlock.editPlan)}
            renderTrigger={({ setVisible }) => (
              <div className="d-flex align-items-center">
                <EditOutlined onClick={() => setVisible?.(true)} />
              </div>
            )}
          />
        </StyledTitle>
        <PriceLabel
          listPrice={listPrice}
          salePrice={isOnSale && salePrice ? salePrice : undefined}
          downPrice={discountDownPrice || undefined}
          periodType={isSubscription ? periodType : undefined}
          periodAmount={periodAmount}
          variant="full-detail"
        />
        <Divider className="my-3" />

        {!isSubscription && periodAmount && periodType && (
          <StyledText>
            {formatMessage(messages.availableForLimitTime, {
              amount: periodAmount,
              unit:
                periodType === 'D'
                  ? formatMessage(commonMessages.unit.day)
                  : periodType === 'W'
                  ? formatMessage(commonMessages.unit.week)
                  : periodType === 'M'
                  ? formatMessage(commonMessages.unit.month)
                  : periodType === 'Y'
                  ? formatMessage(commonMessages.unit.year)
                  : formatMessage(commonMessages.label.unknownPeriod),
            })}
          </StyledText>
        )}

        <div className="mb-3">
          <BraftContent>{description}</BraftContent>
        </div>
        <StyledEnrollment className="d-flex align-items-center justify-content-between">
          {enabledModules.sku ? (
            <ProductSkuModal
              productId={`ProgramPackagePlan_${id}`}
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
              renderTitle={() => formatMessage(programPackageMessages.ProgramPackagePlanCollectionBlock.skuSetting)}
              renderInputLabel={() => formatMessage(programPackageMessages.ProgramPackagePlanCollectionBlock.sku)}
              onRefetch={() => refetchProductChannelInfo()}
            />
          ) : (
            <div></div>
          )}
          <StyledLabel active={status === formatMessage(commonMessages.status.selling)}>{`${status} / ${formatMessage(
            helperCommonMessages.label.amountParticipants,
            {
              amount: soldQuantity || 0,
            },
          )}`}</StyledLabel>
        </StyledEnrollment>
      </StyledCard>
    )
  }

export const UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION = gql`
  mutation UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION($data: [program_package_plan_insert_input!]!) {
    insert_program_package_plan(
      objects: $data
      on_conflict: { constraint: program_package_plan_pkey, update_columns: position }
    ) {
      affected_rows
    }
  }
`

export default ProgramPackagePlanCollectionBlock
