import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React, { forwardRef } from 'react'
import MemberSelector from '../../components/common/MemberSelector'
import types from '../../types'

const CreatorSelector: React.FC<{
  value?: string
  onChange?: (value: string | null) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }, ref) => {
  const { loading, error, data } = useQuery<types.GET_CREATOR_COLLECTION, types.GET_CREATOR_COLLECTIONVariables>(
    GET_CREATOR_COLLECTION,
    {
      variables: {
        appId: localStorage.getItem('kolable.app.id') || '',
      },
    },
  )

  if (loading) {
    return <Spin />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  const members = data.member.map(member => ({
    id: member.id,
    avatarUrl: member.picture_url,
    name: member.name || member.username,
    username: member.username,
    email: member.email,
  }))

  return <MemberSelector ref={ref} members={members} value={value} onChange={onChange} disabled={disabled} />
}

const GET_CREATOR_COLLECTION = gql`
  query GET_CREATOR_COLLECTION($appId: String!) {
    member(where: { app_id: { _eq: $appId }, roles: { _contains: "content-creator" } }) {
      id
      picture_url
      name
      username
      email
    }
  }
`

export default forwardRef(CreatorSelector)
