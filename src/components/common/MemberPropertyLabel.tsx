import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React from 'react'
import hasura from '../../hasura'

const MemberPropertyLabel: React.FC<{ memberId: string; propertyName: string; suffix?: string }> = ({
  memberId,
  propertyName,
  suffix,
}) => {
  const { data } = useQuery<
    hasura.GetMemberPropertyByMEmberIdAndPropertyName,
    hasura.GetMemberPropertyByMEmberIdAndPropertyNameVariables
  >(
    gql`
      query GetMemberPropertyByMEmberIdAndPropertyName($memberId: String!, $propertyName: String!) {
        member_property(where: { member_id: { _eq: $memberId }, property: { name: { _eq: $propertyName } } }) {
          member_id
          value
          property {
            name
            id
          }
        }
      }
    `,
    { variables: { memberId, propertyName }, skip: !memberId || !propertyName },
  )
  const propertyValue: string | undefined = data?.member_property?.map(property => property.value)[0]

  return (
    <span>
      {propertyValue}
      {!!propertyValue && suffix}
    </span>
  )
}

export default MemberPropertyLabel
