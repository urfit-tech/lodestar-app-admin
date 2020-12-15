import { useQuery } from '@apollo/react-hooks'
import { Button, Card } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, memberMessages } from '../../helpers/translation'
import types from '../../types'

const messages = defineMessages({
  agreed: { id: 'contract.status.agreed', defaultMessage: '已簽署' },
  pending: { id: 'contract.status.pending', defaultMessage: '未簽署' },
  revoked: { id: 'contract.status.revoked', defaultMessage: '已解約' },
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
  const { contracts } = useMemberContracts(memberId)

  return (
    <div className="container">
      <a href={`/admin/members/${memberId}/contracts/new`} target="_blank" rel="noopener noreferrer" className="mb-5">
        <Button type="primary">{formatMessage(commonMessages.ui.createContract)}</Button>
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

            <StyledDescription>
              {formatMessage(memberMessages.text.startedAt, {
                time: moment(contract.startedAt).format('YYYY-MM-DD HH:mm:ss'),
              })}
              <br />
              {formatMessage(memberMessages.text.endedAt, {
                time: moment(contract.endedAt).format('YYYY-MM-DD HH:mm:ss'),
              })}
            </StyledDescription>
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

export default MemberContractAdminBlock
