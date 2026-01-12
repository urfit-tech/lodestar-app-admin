import { gql, useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useState } from 'react'
import hasura from '../../hasura'

const ReferralMemberSelector: React.VFC<SelectProps<string>> = ({ ...selectProps }) => {
  const [referralMemberFilter, setReferralMemberFilter] = useState('')

  const condition = referralMemberFilter
    ? {
        _or: [
          { name: { _ilike: `%${referralMemberFilter}%` } },
          { username: { _ilike: `%${referralMemberFilter}%` } },
          { email: { _ilike: `%${referralMemberFilter}%` } },
        ],
      }
    : {}

  const { loading, error, data } = useQuery<hasura.GET_REFERRAL_MEMBER, hasura.GET_REFERRAL_MEMBERVariables>(
    gql`
      query GET_REFERRAL_MEMBER($condition: member_bool_exp!) {
        member(where: { _and: [{ member_contracts: {} }, $condition] }, limit: 10) {
          id
          name
          email
        }
      }
    `,
    {
      variables: {
        condition,
      },
    },
  )

  return (
    <Select<string>
      loading={loading || !!error}
      allowClear
      showSearch
      filterOption={false}
      onSearch={v => setReferralMemberFilter(v)}
      style={{ width: '150px' }}
      {...selectProps}
    >
      {data?.member.map(v => (
        <Select.Option key={v.name} value={v.id}>
          {v.name}
        </Select.Option>
      ))}
    </Select>
  )
}

export default ReferralMemberSelector
