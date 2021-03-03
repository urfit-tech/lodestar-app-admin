import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Card, message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import types from '../../types'

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

const StyledCard = styled(Card)`
  margin-bottom: 1.25rem;
  width: 100%;
`
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
  const { loadingContracts, errorContracts, contracts, refetchContracts } = useMemberContracts(memberId)
  const [revokeMemberContract] = useMutation(REVOKE_MEMBER_CONTRACT)
  const [revokeLoading, setRevokeLoading] = useState(false)

  if (loadingContracts || errorContracts || !contracts) {
    return <Skeleton active />
  }
  const handleContractRevoke = async (memberContractId: string, values: any) => {
    if (window.confirm(formatMessage(messages.deleteContractWarning))) {
      setRevokeLoading(true)
      permissions.MEMBER_CONTRACT_REVOKE &&
        (await revokeMemberContract({
          variables: {
            memberContractId,
            revocationValues: {
              endedAt: values.endedAt,
              memberId: values.memberId,
              paymentNo: values.paymentNo,
              startedAt: values.startedAt,
              coinAmount: -values.coinAmount,
              parentProductInfo: {
                parentProductId: values.projectPlanProductId,
              },
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
      <a href={`/admin/members/${memberId}/contracts/new`} target="_blank" rel="noopener noreferrer">
        <Button type="primary" className="mb-5">
          {formatMessage(commonMessages.ui.createContract)}
        </Button>
      </a>

      {contracts.map(contract => (
        <a
          key={contract.id}
          href={`/members/${memberId}/contracts/${contract.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <StyledCard
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
          >
            <StyledMeta>
              {contract.revokedAt
                ? formatMessage(memberMessages.text.revokedAt, {
                    time: moment(contract.revokedAt).format('YYYY-MM-DD HH:mm:ss'),
                  })
                : contract.agreedAt
                ? formatMessage(memberMessages.text.agreedAt, {
                    time: moment(contract.agreedAt).format('YYYY-MM-DD HH:mm:ss'),
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
          </StyledCard>
        </a>
      ))}
    </div>
  )
}

const useMemberContracts = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_MEMBER_CONTRACTS, types.GET_MEMBER_CONTRACTSVariables>(
    gql`
      query GET_MEMBER_CONTRACTS($memberId: String!) {
        member_contract(where: { member_id: { _eq: $memberId } }) {
          id
          started_at
          ended_at
          agreed_at
          agreed_ip
          agreed_options
          revoked_at
          values
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
    agreedIp: string | null
    agreedOptions: any
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
        agreedIp: v.agreed_ip,
        agreedOptions: v.agreed_options,
        revokedAt: v.revoked_at && new Date(v.revoked_at),
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
