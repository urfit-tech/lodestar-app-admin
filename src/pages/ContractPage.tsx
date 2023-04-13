import { gql, useQuery } from '@apollo/client'
import { Card, Typography } from 'antd'
import moment from 'moment'
import { render } from 'mustache'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../hasura'
import { memberMessages } from '../helpers/translation'

const StyledTitle = styled(Typography.Title)`
  && {
    margin-bottom: 36px;
    font-size: 24px;
    font-weight: bold;
    line-height: 1.3;
    letter-spacing: 0.77px;
  }
`
const StyledCard = styled(Card)`
  && {
    margin-bottom: 20px;
  }

  .ant-card-body {
    padding: 40px;
  }

  p,
  li {
    margin-bottom: 0;
    line-height: 1.69;
    letter-spacing: 0.2px;
  }

  ol {
    padding-left: 50px;
    li {
      padding-left: 16px;
    }
  }
`
const StyledSection = styled.section`
  background: #f7f8f8;
  padding-top: 56px;
  padding-bottom: 80px;
  text-align: justify;

  ol p {
    text-indent: 2rem;
  }
`

const ContractPage: React.FC = () => {
  const { memberContractId } = useParams<{ memberId: string; memberContractId: string }>()
  const { formatMessage } = useIntl()
  const { memberContract } = useMemberContract(memberContractId)

  return (
    <StyledSection>
      <div className="container">
        <StyledTitle level={1} className="text-center">
          {formatMessage(memberMessages.label.onlineProgramContract)}
        </StyledTitle>
        <StyledCard>
          <div dangerouslySetInnerHTML={{ __html: render(memberContract.contract.template, memberContract.values) }} />
        </StyledCard>
        <StyledCard className="text-center">
          {memberContract.revokedAt ? (
            <p>
              {formatMessage(memberMessages.text.revokedAt, {
                time: moment(memberContract.revokedAt).format('YYYY-MM-DD HH:mm:ss'),
              })}
            </p>
          ) : memberContract.agreedAt ? (
            <p>
              {formatMessage(memberMessages.text.agreedAt, {
                time: moment(memberContract.agreedAt).format('YYYY-MM-DD HH:mm:ss'),
              })}
            </p>
          ) : memberContract.startedAt && moment() >= moment(memberContract.startedAt) ? (
            <p>{formatMessage(memberMessages.text.unavailableContract)}</p>
          ) : null}
        </StyledCard>
      </div>
    </StyledSection>
  )
}

const useMemberContract = (memberContractId: string) => {
  const GET_MEMBER_CONTRACT = gql`
    query GET_MEMBER_CONTRACT($memberContractId: uuid!) {
      member_contract_by_pk(id: $memberContractId) {
        started_at
        ended_at
        values
        agreed_at
        agreed_ip
        revoked_at
        agreed_options
        contract {
          name
          description
          template
        }
      }
    }
  `
  const { data, ...result } = useQuery<hasura.GET_MEMBER_CONTRACT, hasura.GET_MEMBER_CONTRACTVariables>(
    GET_MEMBER_CONTRACT,
    {
      variables: { memberContractId },
    },
  )

  return {
    ...result,
    memberContract: {
      startedAt: data?.member_contract_by_pk?.started_at || null,
      endedAt: data?.member_contract_by_pk?.ended_at || null,
      values: data?.member_contract_by_pk?.values,
      agreedAt: data?.member_contract_by_pk?.agreed_at || null,
      agreedIp: data?.member_contract_by_pk?.agreed_ip || null,
      agreedOptions: data?.member_contract_by_pk?.agreed_options || {},
      revokedAt: data?.member_contract_by_pk?.revoked_at || null,
      contract: {
        name: data?.member_contract_by_pk?.contract.name || '',
        description: data?.member_contract_by_pk?.contract.description || '',
        template: data?.member_contract_by_pk?.contract.template || '',
      },
    },
  }
}

export default ContractPage
