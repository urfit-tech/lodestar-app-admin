import { Divider } from 'antd'
import moment from 'moment'
import React, { ReactElement } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { rgba } from '../../helpers'
import { ReactComponent as GiftIcon } from '../../images/icon/gift.svg'
import { VoucherPlanBriefProps } from '../../types/checkout'
import { BREAK_POINT } from '../common/Responsive'
import voucherMessages from './translation'
import VoucherPlanDetailModal from './VoucherPlanDetailModal'

const StyledWrapper = styled.div`
  position: relative;
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f7f8f8;
    transform: translateY(-50%);
  }
  &::before {
    left: -10px;
    box-shadow: inset -4px 0 5px 0 rgba(0, 0, 0, 0.06);
  }
  &::after {
    right: -10px;
    box-shadow: inset 4px 0 5px 0 rgba(0, 0, 0, 0.06);
  }
`
const StyledIcon = styled.div<{ available?: boolean }>`
  display: none;

  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background: ${props => (props.available ? rgba(props.theme['@primary-color'], 0.1) : `var(--gray-lighter)`)};
  font-size: 2rem;
  border-radius: 50%;

  svg path {
    fill: ${props => (props.available ? props.theme['@primary-color'] : '#CDCDCD')};
  }

  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
  }
`
const StyledContent = styled.div`
  overflow: hidden;
  font-size: 14px;
`
const StyledExtra = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledMetaData = styled.div`
  width: 100%;
  color: var(--gray-dark);
  font-size: 14px;

  > .anticon {
    font-size: 16px;
    color: #4a4a4a;
  }
`
const StyledTitle = styled.div`
  overflow: hidden;
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const VoucherPlanCard: React.FC<VoucherPlanBriefProps & { renderEditDropdown?: ReactElement }> = ({
  id,
  title,
  startedAt,
  endedAt,
  productQuantityLimit,
  available,
  count,
  remaining,
  renderEditDropdown,
  pinCode,
}) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      <div className="d-flex align-items-center justify-content-start">
        <StyledIcon className="mr-3" available={available}>
          <GiftIcon />
        </StyledIcon>

        <StyledContent className="flex-grow-1">
          <StyledTitle className="mb-1">{title}</StyledTitle>
          <div>
            {startedAt
              ? moment(startedAt).format('YYYY/MM/DD')
              : formatMessage(voucherMessages.VoucherPlanCard.fromNow)}
            {' ~ '}
            {endedAt ? moment(endedAt).format('YYYY/MM/DD') : formatMessage(voucherMessages.VoucherPlanCard.forever)}
          </div>

          <StyledExtra className="d-flex align-items-center justify-content-between mt-4">
            <div>
              <span>
                {formatMessage(voucherMessages.VoucherPlanCard.exchangeItemsNumber, {
                  number: productQuantityLimit,
                })}
              </span>
              {pinCode ? (
                <>
                  <span> / </span>
                  <span>{formatMessage(voucherMessages.VoucherPlanCard.pinCode, { pinCode })}</span>
                </>
              ) : null}
            </div>
          </StyledExtra>
        </StyledContent>
      </div>

      <Divider />
      <StyledMetaData className="d-flex justify-content-between align-items-center">
        <VoucherPlanDetailModal id={id} title={title} />

        <div className="flex-grow-1">
          {formatMessage(voucherMessages.VoucherPlanCard.exchangedCount, {
            exchanged: count - remaining,
            total: count,
          })}
        </div>
        <>{renderEditDropdown}</>
      </StyledMetaData>
    </StyledWrapper>
  )
}

export default VoucherPlanCard
