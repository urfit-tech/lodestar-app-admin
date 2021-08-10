import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useApp } from '../../contexts/AppContext'
import hasura from '../../hasura'
import MemberSelector from '../form/MemberSelector'

const SalesMemberInput: React.FC<{
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }) => {
  const { id: appId } = useApp()
  const { loading, error, data } = useQuery<hasura.GET_SALES_MEMBERS>(GET_SALES_MEMBERS, { variables: { appId } })

  if (loading) {
    return <Spin />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  return (
    <MemberSelector
      allowClear
      members={data.order_executor.map(v => ({
        id: v.member.id,
        avatarUrl: v.member.picture_url,
        name: v.member.name,
        username: v.member.username,
        email: v.member.email,
      }))}
      value={value}
      onChange={value => typeof value === 'string' && onChange?.(value)}
      disabled={disabled}
    />
  )
}

const GET_SALES_MEMBERS = gql`
  query GET_SALES_MEMBERS($appId: String!) {
    order_executor(distinct_on: [member_id], where: { member: { app_id: { _eq: $appId } } }) {
      member {
        id
        picture_url
        name
        username
        email
      }
    }
  }
`

export default SalesMemberInput
