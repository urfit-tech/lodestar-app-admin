import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Card, message, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError, notEmpty } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useAppCustom } from '../../hooks'

const messages = defineMessages({
  agreed: { id: 'contract.status.agreed', defaultMessage: '已簽署' },
  pending: { id: 'contract.status.pending', defaultMessage: '未簽署' },
  revoked: { id: 'contract.status.revoked', defaultMessage: '已解約' },
  revokeContract: { id: 'contract.ui.revokeContract', defaultMessage: '解除合約' },
  successfullyRevoked: { id: 'contract.event.successfullyRevoked', defaultMessage: '合約已解除！' },
  deleteContractWarning: {
    id: 'contract.text.deleteContractWarning',
    defaultMessage: '你確定要解除合約？此操作無法復原，請審慎評估！',
  },
})

const StyledLabel = styled.span<{ variant?: 'default' | 'agreed' | 'revoked' }>`
  color: ${props =>
    props.variant === 'agreed'
      ? props.theme['@primary-color']
      : props.variant === 'revoked'
      ? 'var(--gray-dark)'
      : 'var(--gray-darker)'};
  font-size: 1rem;
  font-weight: normal;
`
const StyledMeta = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-dark);
  font-size: 14px;
`
const StyledDescription = styled.div`
  color: var(--gray-darker);
  line-height: 1.69;
  letter-spacing: 0.2px;
`

const MemberContractAdminBlock: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()
  const { settings } = useApp()
  const { loadingContracts, errorContracts, contracts, refetchContracts } = useMemberContracts(memberId)
  const [revokeMemberContract] = useMutation(REVOKE_MEMBER_CONTRACT)
  const [revokeLoading, setRevokeLoading] = useState(false)
  const appCustom = useAppCustom()

  const title = appCustom.contractProjectPlan.title

  if (loadingContracts || errorContracts || !contracts) {
    return <Skeleton active />
  }
  const handleContractRevoke = async (memberContractId: string, values: any) => {
    type Coupon = hasura.coupon_insert_input

    if (window.confirm(formatMessage(messages.deleteContractWarning))) {
      setRevokeLoading(true)
      permissions.MEMBER_CONTRACT_REVOKE &&
        (await revokeMemberContract({
          variables: {
            memberContractId,
            revocationValues: {
              memberId: values?.memberId || memberId,
              revokedAt: new Date(),
              orderId: values?.orderId || '',
              paymentNo: values?.paymentNo || '',
              parentProductInfo: {
                parentProductId:
                  values?.projectPlanProductId ||
                  values?.orderProducts?.find(
                    (v: { name?: string; product_id?: string }) =>
                      v.name?.includes(title) && v.product_id?.includes('ProjectPlan'),
                  )?.product_id ||
                  '',
              },
              coinLogIds: values?.coinLogs?.map((v: { id: string }) => v.id) || [],
              couponPlanId:
                values?.coupons?.find((v: Coupon) => !v.id && !!v.coupon_code?.data?.coupon_plan)?.coupon_code?.data
                  ?.coupon_plan?.data?.id || null,
              // delete contract coupon
              contractCouponIds: values?.coupons?.map((v: Pick<Coupon, 'id'>) => v.id).filter(notEmpty) || [],
              contractCouponCodes:
                values?.coupons
                  ?.filter((v: Pick<Coupon, 'id'>) => v.id)
                  .map((v: Pick<Coupon, 'coupon_code'>) => v.coupon_code?.data.code) || [],
            },
            revokedAt: new Date(),
          },
        })
          .then(() => {
            message.success(formatMessage(messages.successfullyRevoked))
            refetchContracts()
          })
          .catch(handleError))
      setRevokeLoading(false)
    }
  }
  return (
    <div className="container">
      <a
        href={
          settings['contract_page.v2.enabled'] === '1'
            ? `/admin/members/${memberId}/contract/create`
            : `/admin/members/${memberId}/new-contract`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="primary" className="mb-5">
          {formatMessage(commonMessages.ui.createContract)}
        </Button>
      </a>

      {contracts
        .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
        .map(contract => (
          <a
            key={contract.id}
            href={`/members/${memberId}/contracts/${contract.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card
              title={
                <div className="d-flex align-items-center justify-content-between">
                  <span className="mr-1">{contract.title}</span>
                  {contract.revokedAt ? (
                    <StyledLabel variant="revoked">{formatMessage(messages.revoked)}</StyledLabel>
                  ) : contract.agreedAt ? (
                    <StyledLabel variant="agreed">{formatMessage(messages.agreed)}</StyledLabel>
                  ) : (
                    <StyledLabel>{formatMessage(messages.pending)}</StyledLabel>
                  )}
                </div>
              }
              className="mb-4"
            >
              <StyledMeta>
                {contract.agreedAt
                  ? formatMessage(memberMessages.text.agreedAt, {
                      time: moment(contract.agreedAt).format('YYYY-MM-DD HH:mm:ss'),
                    })
                  : null}
                <br />
                {contract.revokedAt
                  ? formatMessage(memberMessages.text.revokedAt, {
                      time: moment(contract.revokedAt).format('YYYY-MM-DD HH:mm:ss'),
                    })
                  : null}
              </StyledMeta>
              <div className="d-flex align-items-center justify-content-between">
                <StyledDescription>
                  {formatMessage(memberMessages.text.startedAt, {
                    time: moment(contract.startedAt).format('YYYY-MM-DD HH:mm:ss'),
                  })}
                  <br />
                  {formatMessage(memberMessages.text.endedAt, {
                    time: moment(contract.endedAt).format('YYYY-MM-DD HH:mm:ss'),
                  })}
                </StyledDescription>
                {permissions.MEMBER_CONTRACT_REVOKE && contract.agreedAt && !contract.revokedAt && (
                  <Button
                    danger
                    loading={revokeLoading}
                    onClick={e => {
                      e.preventDefault()
                      handleContractRevoke(contract.id, contract.values)
                    }}
                  >
                    {formatMessage(messages.revokeContract)}
                  </Button>
                )}
              </div>
            </Card>
          </a>
        ))}
    </div>
  )
}

const useMemberContracts = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MEMBER_CONTRACTS, hasura.GET_MEMBER_CONTRACTSVariables>(
    gql`
      query GET_MEMBER_CONTRACTS($memberId: String!) {
        member_contract(where: { member_id: { _eq: $memberId } }) {
          id
          started_at
          ended_at
          agreed_at
          agreed_ip
          created_at
          agreed_options
          revoked_at
          values
          options
          contract {
            id
            name
          }
        }
      }
    `,
    { variables: { memberId } },
  )

  const contracts: {
    id: string
    title: string
    values: any
    startedAt: Date | null
    endedAt: Date | null
    agreedAt: Date | null
    createdAt: Date
    agreedIp: string | null
    agreedOptions: any
    options: any
    revokedAt: Date | null
  }[] =
    data?.member_contract.map(v => {
      return {
        id: v.id,
        title: v.contract.name,
        values: v.values,
        startedAt: v.started_at && new Date(v.started_at),
        endedAt: v.ended_at && new Date(v.ended_at),
        agreedAt: v.agreed_at && new Date(v.agreed_at),
        agreedIp: v.agreed_ip || null,
        agreedOptions: v.agreed_options,
        options: v.options,
        revokedAt: v.revoked_at && new Date(v.revoked_at),
        createdAt: v.created_at && new Date(v.created_at),
      }
    }) || []
  return {
    loadingContracts: loading,
    errorContracts: error,
    contracts,
    refetchContracts: refetch,
  }
}
const REVOKE_MEMBER_CONTRACT = gql`
  mutation REVOKE_MEMBER_CONTRACT($memberContractId: uuid!, $revocationValues: jsonb!, $revokedAt: timestamptz!) {
    update_member_contract(
      where: { id: { _eq: $memberContractId } }
      _set: { revocation_values: $revocationValues, revoked_at: $revokedAt }
    ) {
      affected_rows
    }
  }
`
export default MemberContractAdminBlock
