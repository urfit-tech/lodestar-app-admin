import { gql, useQuery } from '@apollo/client'
import { Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import MemberSelector from '../form/MemberSelector'
import commonMessages from './translation'

const SalesMemberInput: React.FC<{
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { loading, error, data } = useQuery<hasura.GET_SALES_MEMBERS>(GET_SALES_MEMBERS, { variables: { appId } })

  if (loading) {
    return <Spin />
  }

  if (error || !data) {
    return <div>{formatMessage(commonMessages.SalesMemberInput.loadError)}</div>
  }

  return (
    <MemberSelector
      allowClear
      members={data?.member?.map(v => ({
        id: v.id,
        avatarUrl: v.picture_url || null,
        name: v.name,
        username: v.username,
        email: v.email,
      }))}
      value={value}
      onChange={value => typeof value === 'string' && onChange?.(value)}
      disabled={disabled}
    />
  )
}
// member: searchText(username, email, name) limit:20
// searchable
const GET_SALES_MEMBERS = gql`
  query GET_SALES_MEMBERS($appId: String!) {
    member(where: { app_id: { _eq: $appId }, member_permissions: { permission_id: { _eq: "BACKSTAGE_ENTER" } } }) {
      id
      picture_url
      name
      username
      email
    }
  }
`

export default SalesMemberInput
