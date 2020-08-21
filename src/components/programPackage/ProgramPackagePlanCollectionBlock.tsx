import Icon, { EditOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Popover } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'
import types from '../../types'
import { ProgramPackagePlanProps } from '../../types/programPackage'
import PositionAdminLayout, {
  OverlayBlock,
  OverlayList,
  OverlayListContent,
  OverlayListItem,
  OverlayWrapper,
} from '../common/PositionAdminLayout'
import PriceLabel from '../common/PriceLabel'
import { BraftContent } from '../common/StyledBraftEditor'
import ProgramPackagePlanAdminModal from './ProgramPackagePlanAdminModal'

const messages = defineMessages({
  people: { id: 'programPackage.term.people', defaultMessage: '人' },
  availableForLimitTime: { id: 'programPackage.label.availableForLimitTime', defaultMessage: '可觀看 {amount} {unit}' },
  unknownPeriod: { id: 'common.term.unknownPeriod', defaultMessage: '未知週期' },
})

const StyledButton = styled(Button)`
  && {
    background: none;
    border: 1px solid white;
    color: white;
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
  const [updatePosition] = useMutation<
    types.UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTION,
    types.UPDATE_PROGRAM_PACKAGE_PLAN_POSITION_COLLECTIONVariables
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
          }).then(() => onRefetch && onRefetch())
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
                      <StyledButton block icon={<EditOutlined />} onClick={() => setVisible(true)}>
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
      : formatMessage(commonMessages.status.notPublished)

  return (
    <StyledCard>
      <StyledTitle className="mb-3 d-flex justify-content-between">
        <span>{title}</span>
        <StyledLabel active={status === formatMessage(commonMessages.status.selling)}>{status}</StyledLabel>
      </StyledTitle>
      <PriceLabel
        listPrice={listPrice}
        salePrice={isOnSale && salePrice ? salePrice : undefined}
        downPrice={discountDownPrice || undefined}
        periodType={isSubscription ? periodType : undefined}
        periodAmount={periodAmount}
      />
      <Divider className="my-3" />

      {!isSubscription && (
        <StyledText>
          {formatMessage(messages.availableForLimitTime, {
            amount: periodAmount,
            unit:
              periodType === 'D'
                ? formatMessage(commonMessages.label.day)
                : periodType === 'W'
                ? formatMessage(commonMessages.label.week)
                : periodType === 'M'
                ? formatMessage(commonMessages.label.month)
                : periodType === 'Y'
                ? formatMessage(commonMessages.label.year)
                : formatMessage(messages.unknownPeriod),
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
