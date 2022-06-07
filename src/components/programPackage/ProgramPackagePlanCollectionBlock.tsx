import Icon, { BarcodeOutlined, EditOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Popover, Tag } from 'antd'
import gql from 'graphql-tag'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'
import { ProgramPackagePlanProps } from '../../types/programPackage'
import PositionAdminLayout, {
  OverlayBlock,
  OverlayList,
  OverlayListContent,
  OverlayListItem,
  OverlayWrapper,
} from '../admin/PositionAdminLayout'
import ProductSkuModal from '../common/ProductSkuModal'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import ProgramPackagePlanAdminModal from './ProgramPackagePlanAdminModal'

const messages = defineMessages({
  people: { id: 'programPackage.label.people', defaultMessage: '人' },
  availableForLimitTime: { id: 'programPackage.label.availableForLimitTime', defaultMessage: '可觀看 {amount} {unit}' },
})

const StyledButton = styled(Button)`
  && {
    background: none;
    border: 1px solid white;
    color: white;
    span:nth-child(2) {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`
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

const ProgramPackagePlanCollectionBlock: React.FC<{
  programPackageId: string
  plans: ProgramPackagePlanProps[]
  onRefetch?: () => void
}> = ({ programPackageId, plans, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [updatePosition] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION,
    hasura.UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION)

  return (
    <div className="row py-5">
      <PositionAdminLayout<ProgramPackagePlanProps>
        value={plans}
        onChange={value =>
          updatePosition({
            variables: {
              data: value.map((plan, index) => ({
                id: plan.id,
                program_package_id: programPackageId,
                is_subscription: plan.isSubscription,
                title: plan.title,
                period_amount: plan.periodAmount,
                period_type: plan.periodType,
                list_price: plan.listPrice,
                position: index,
              })),
            },
          }).then(() => onRefetch?.())
        }
        renderItem={(plan, currentIndex, moveTarget) => (
          <div key={plan.id} className="col-12 col-md-6 mb-4">
            <OverlayWrapper>
              <ProgramPackagePlanCard {...plan} />

              <OverlayBlock>
                <div>
                  <ProgramPackagePlanAdminModal
                    programPackageId={programPackageId}
                    onRefetch={onRefetch}
                    plan={plan}
                    title={formatMessage(programPackageMessages.ui.editPlan)}
                    renderTrigger={({ setVisible }) => (
                      <StyledButton block icon={<EditOutlined />} onClick={() => setVisible?.(true)}>
                        {formatMessage(programPackageMessages.ui.editPlan)}
                      </StyledButton>
                    )}
                  />

                  <Popover
                    placement="bottomLeft"
                    content={
                      <OverlayList
                        header={formatMessage(commonMessages.label.currentPosition, {
                          position: currentIndex + 1,
                        })}
                      >
                        <OverlayListContent>
                          {plans.map((plan, index) => (
                            <OverlayListItem
                              key={plan.id}
                              className={currentIndex === index ? 'active' : ''}
                              onClick={() => moveTarget(currentIndex, index)}
                            >
                              <span className="flex-shrink-0">{index + 1}</span>
                              <span>{plan.title}</span>
                            </OverlayListItem>
                          ))}
                        </OverlayListContent>
                      </OverlayList>
                    }
                  >
                    <StyledButton block className="mt-4">
                      <Icon component={() => <MoveIcon />} />
                      {formatMessage(commonMessages.ui.changePosition)}
                    </StyledButton>
                  </Popover>

                  {enabledModules.sku && (
                    <ProductSkuModal
                      productId={`ProgramPackagePlan_${plan.id}`}
                      renderTrigger={({ onOpen, sku }) => (
                        <StyledButton block className="mt-4" onClick={() => onOpen?.()}>
                          <Icon component={() => <BarcodeOutlined />} />
                          {sku
                            ? `${formatMessage(commonMessages.label.sku)}: ${sku}`
                            : formatMessage(commonMessages.label.skuSetting)}
                        </StyledButton>
                      )}
                    />
                  )}
                </div>
              </OverlayBlock>
            </OverlayWrapper>
          </div>
        )}
      />
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
const ProgramPackagePlanCard: React.FC<ProgramPackagePlanProps> = ({
  title,
  description,
  periodAmount,
  periodType,
  listPrice,
  salePrice,
  soldAt,
  discountDownPrice,
  isSubscription,
  publishedAt,
  soldQuantity,
}) => {
  const { formatMessage } = useIntl()
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
        <StyledLabel active={status === formatMessage(commonMessages.status.selling)}>{status}</StyledLabel>
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
      <StyledEnrollment className="mb-3">
        <span className="mr-2">{soldQuantity || 0}</span>
        <span>{formatMessage(messages.people)}</span>
      </StyledEnrollment>
    </StyledCard>
  )
}

const UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION = gql`
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
