import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React, { forwardRef } from 'react'
import { useIntl } from 'react-intl'
import MemberSelector from '../../components/common/MemberSelector'
import { errorMessages } from '../../helpers/translation'
import types from '../../types'

const CreatorSelector: React.FC<{
  value?: string
  onChange?: (value: string | null) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }, ref) => {
  const { formatMessage } = useIntl()
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
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
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
    member(where: { app_id: { _eq: $appId }, role: { _in: ["content-creator", "app-owner"] } }) {
      id
      picture_url
      name
      username
      email
    }
  }
`

export default forwardRef(CreatorSelector)
