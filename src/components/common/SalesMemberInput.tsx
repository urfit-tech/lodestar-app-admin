import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import MemberSelector from 'lodestar-app-admin/src/components/form/MemberSelector'
import React from 'react'
import styled from 'styled-components'
import types from '../../types'

const StyledWrapper = styled.div`
  width: 350px;
`

const SalesMemberInput: React.FC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {
  const { loading, error, data } = useQuery<types.GET_SALES_MEMBERS>(GET_SALES_MEMBERS)

  if (loading) {
    return <Spin />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  return (
    <StyledWrapper>
      <MemberSelector
        members={data.member.map(v => ({
          id: v.id,
          avatarUrl: v.picture_url,
          name: v.name,
          username: v.username,
          email: v.email,
        }))}
        value={value}
        onChange={value => typeof value === 'string' && onChange?.(value)}
      />
    </StyledWrapper>
  )
}

const GET_SALES_MEMBERS = gql`
  query GET_SALES_MEMBERS {
    member(where: { member_properties: { property: { name: { _eq: "分機號碼" } }, value: { _is_null: false } } }) {
      id
      picture_url
      name
      username
      email
    }
  }
`

export default SalesMemberInput
