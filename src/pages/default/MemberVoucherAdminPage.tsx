import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { BREAK_POINT } from '../../components/common/Responsive'
import MemberAdminLayout from '../../components/layout/MemberAdminLayout'
import hasura from '../../hasura'
import { rgba } from '../../helpers'
import { useMemberAdmin } from '../../hooks/member'
import { ReactComponent as GiftIcon } from '../../images/icon/gift.svg'

const messages = defineMessages({
  available: { id: 'voucher.status.available', defaultMessage: '可使用' },
  expired: { id: 'voucher.status.expired', defaultMessage: '已失效' },
  fromNow: { id: 'voucher.text.fromNow', defaultMessage: '即日起' },
  noUsePeriod: { id: 'voucher.text.noUsePeriod', defaultMessage: '無使用期限' },
  redeemable: { id: 'voucher.status.redeemable', defaultMessage: '可兌換' },
  items: { id: 'voucher.text.items', defaultMessage: '個項目' },
})

type VoucherProps = {
  id: string
  title: string
  description: string | null
  startedAt?: Date
  endedAt?: Date
  productQuantityLimit: number
  available: boolean
}

const MemberVoucherAdminPage: React.VFC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin} onRefetch={refetchMemberAdmin}>
      <div className="p-5">
        <VoucherCollectionBlock memberId={memberId} />
      </div>
    </MemberAdminLayout>
  )
}

const VoucherCollectionBlock: React.VFC<{
  memberId: string
}> = ({ memberId }) => {
  const { loading, error, data } = useQuery<
    hasura.GET_MEMBER_VOUCHER_COLLECTION,
    hasura.GET_MEMBER_VOUCHER_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_VOUCHER_COLLECTION($memberId: String!) {
        voucher(where: { member_id: { _eq: $memberId } }, order_by: [{ created_at: desc }]) {
          id
          status {
            outdated
            used
          }
          voucher_code {
            id
            code
            voucher_plan {
              id
              title
              description
              started_at
              ended_at
              product_quantity_limit
              voucher_plan_products {
                id
                product_id
              }
            }
          }
        }
      }
    `,
    {
      variables: { memberId },
    },
  )

  if (loading || error) {
    return <Skeleton active />
  }

  const vouchers: (VoucherProps & {
    productIds: string[]
  })[] =
    data?.voucher.map(voucher => ({
      id: voucher.id,
      title: voucher.voucher_code.voucher_plan.title,
      startedAt: voucher.voucher_code.voucher_plan.started_at
        ? new Date(voucher.voucher_code.voucher_plan.started_at)
        : undefined,
      endedAt: voucher.voucher_code.voucher_plan.ended_at
        ? new Date(voucher.voucher_code.voucher_plan.ended_at)
        : undefined,
      productQuantityLimit: voucher.voucher_code.voucher_plan.product_quantity_limit,
      available: !!voucher.status && !voucher.status.outdated && !voucher.status.used,
      productIds: voucher.voucher_code.voucher_plan.voucher_plan_products.map(product => product.product_id),
      description: decodeURI(voucher.voucher_code.voucher_plan.description || ''),
    })) || []

  return <VoucherCollectionTabs vouchers={vouchers} />
}
const VoucherCollectionTabs: React.VFC<{
  vouchers: VoucherProps[]
}> = ({ vouchers }) => {
  const [activeKey, setActiveKey] = useState('available')
  const { formatMessage } = useIntl()

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

export default MemberVoucherAdminPage
