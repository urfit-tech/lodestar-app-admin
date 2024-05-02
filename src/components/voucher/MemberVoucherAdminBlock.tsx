import Icon from '@ant-design/icons'
import { Skeleton, Tabs } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { rgba } from '../../helpers'
import { useEnrolledVoucherCollection } from '../../hooks/voucher'
import { ReactComponent as GiftIcon } from '../../images/icon/gift.svg'
import { VoucherProps } from '../../types/voucher'
import { BREAK_POINT } from '../common/Responsive'

const messages = defineMessages({
  available: { id: 'voucher.status.available', defaultMessage: '可使用' },
  expired: { id: 'voucher.status.expired', defaultMessage: '已失效' },
  fromNow: { id: 'voucher.text.fromNow', defaultMessage: '即日起' },
  noUsePeriod: { id: 'voucher.text.noUsePeriod', defaultMessage: '無使用期限' },
  redeemable: { id: 'voucher.status.redeemable', defaultMessage: '可兌換' },
  items: { id: 'voucher.text.items', defaultMessage: '個項目' },
})

const MemberVoucherAdminBlock: React.VFC<{
  memberId: string
}> = ({ memberId }) => {
  const { loading, error, data: vouchers } = useEnrolledVoucherCollection(memberId)
  if (loading || error) {
    return <Skeleton active />
  }

  return <VoucherCollectionTabs vouchers={vouchers} />
}
const VoucherCollectionTabs: React.VFC<{
  vouchers: VoucherProps[]
}> = ({ vouchers }) => {
  const [activeKey, setActiveKey] = useState('available')
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  const tabContents: {
    key: string
    name: string
    isDisplay: (order: VoucherProps) => boolean
  }[] = [
    {
      key: 'available',
      name: formatMessage(messages.available),
      isDisplay: voucher => voucher.available,
    },
    {
      key: 'unavailable',
      name: formatMessage(messages.expired),
      isDisplay: voucher => !voucher.available,
    },
  ]

  return (
    <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
      {tabContents.map(v => (
        <Tabs.TabPane key={v.key} tab={v.name}>
          <div className="row">
            {vouchers.filter(v.isDisplay).map(voucher => (
              <div key={voucher.id} className="col-12 col-lg-6">
                <Voucher {...voucher} />
              </div>
            ))}
          </div>
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

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

const Voucher: React.VFC<VoucherProps> = ({ title, startedAt, endedAt, productQuantityLimit, available }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      <div className="d-flex align-items-center justify-content-start">
        <StyledIcon className="mr-3" available={available}>
          <Icon component={() => <GiftIcon />} />
        </StyledIcon>

        <StyledContent className="flex-grow-1">
          <StyledTitle className="mb-1">{title}</StyledTitle>
          <div>
            {startedAt ? moment(startedAt).format('YYYY/MM/DD') : formatMessage(messages.fromNow)}
            {' ~ '}
            {endedAt ? moment(endedAt).format('YYYY/MM/DD') : formatMessage(messages.noUsePeriod)}
          </div>

          <StyledExtra className="d-flex align-items-center justify-content-between mt-4">
            <div>{`${formatMessage(messages.redeemable)} ${productQuantityLimit} ${formatMessage(
              messages.items,
            )}`}</div>
          </StyledExtra>
        </StyledContent>
      </div>
    </StyledWrapper>
  )
}

export default MemberVoucherAdminBlock
