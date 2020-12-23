import { Button } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'

const messages = defineMessages({
  limited: { id: 'product.project.text.limited', defaultMessage: '限量' },
  participants: { id: 'product.project.text.participants', defaultMessage: '參與者' },
  availableForLimitTime: {
    id: 'common.label.availableForLimitTime',
    defaultMessage: '可觀看 {amount} {unit}',
  },
})

const StyledButton = styled(Button)`
  && {
    margin-top: 20px;
    width: 100%;
  }
`
const StyledWrapper = styled.div`
  background: white;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease-in-out;
`
const CoverImage = styled.div<{ src: string }>`
  padding-top: calc(100% / 3);
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledPeriod = styled.div`
  color: ${props => props.theme['@primary-color']};
`
const StyledDescription = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.18px;
`
const StyledProjectPlanInfo = styled.div<{ active?: boolean }>`
  display: inline-block;
  border-radius: 4px;
  background: ${props => (props.active ? `${props.theme['@primary-color']}19` : 'var(--gray-lighter)')};

  .wrapper {
    padding: 10px 0;
    line-height: 12px;

    div {
    }
  }
`
const StyledProjectPlanInfoWrapper = styled.div`
  padding: 10px 0;
  line-height: 12px;
`
const StyledProjectPlanInfoBlock = styled.div<{ active?: boolean }>`
  display: inline-block;
  line-height: 1;
  font-size: 12px;
  letter-spacing: 0.15px;
  color: ${props => (props.active ? `${props.theme['@primary-color']}` : 'var(--gray-dark)')};
  padding: 0 10px;

  &:last-child:not(:first-child) {
    border-left: 1px solid ${props => (props.active ? `${props.theme['@primary-color']}` : 'var(--gray-dark)')};
  }
`

const ProjectPlanCard: React.FC<{}> = ({}) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      {/* <CoverImage src={coverUrl || EmptyCover} />
      <div className="p-4">
        <StyledTitle className="mb-3">{title}</StyledTitle>

        <div className="mb-3">
          <PriceLabel
            variant="full-detail"
            listPrice={listPrice}
            salePrice={(soldAt?.getTime() || 0) > Date.now() ? salePrice : undefined}
            downPrice={isSubscription && discountDownPrice > 0 ? discountDownPrice : undefined}
            periodAmount={periodAmount}
            periodType={periodType ? (periodType as PeriodType) : undefined}
          />
        </div>

        {!isSubscription && periodType && (
          <StyledPeriod className="mb-3">
            {formatMessage(messages.availableForLimitTime, {
              amount: periodAmount || 1,
              unit: <ShortenPeriodTypeLabel periodType={periodType as PeriodType} withQuantifier />,
            })}
          </StyledPeriod>
        )}

        {(isLimited || isParticipantsVisible) && (
          <StyledProjectPlanInfo
            className="mb-4"
            active={!isExpired && (!isLimited || Boolean(buyableQuantity && buyableQuantity > 0))}
          >
            <StyledProjectPlanInfoWrapper>
              {isParticipantsVisible && (
                <StyledProjectPlanInfoBlock
                  active={!isExpired && (!isLimited || Boolean(buyableQuantity && buyableQuantity > 0))}
                >{`${formatMessage(messages.participants)} ${projectPlanEnrollmentCount}`}</StyledProjectPlanInfoBlock>
              )}
            </StyledProjectPlanInfoWrapper>
          </StyledProjectPlanInfo>
        )}

        <StyledDescription className="mb-4">
          <BraftContent>{description}</BraftContent>
        </StyledDescription>

        <div>
          {isExpired ? (
            <span>{formatMessage(commonMessages.status.finished)}</span>
          ) : isLimited && !buyableQuantity ? (
            <span>{formatMessage(commonMessages.button.soldOut)}</span>
          ) : isEnrolled === false ? (
            isSubscription ? (
              <SubscriptionPlanBlock
                projectPlanId={id}
                projectTitle={projectTitle}
                title={title}
                isPhysical={isPhysical}
                listPrice={listPrice}
                salePrice={salePrice}
              />
            ) : (
              <PerpetualPlanBlock
                projectPlanId={id}
                projectTitle={projectTitle}
                title={title}
                isPhysical={isPhysical}
                listPrice={listPrice}
                salePrice={salePrice}
              />
            )
          ) : null}
        </div>
      </div> */}
    </StyledWrapper>
  )
}

export default ProjectPlanCard
