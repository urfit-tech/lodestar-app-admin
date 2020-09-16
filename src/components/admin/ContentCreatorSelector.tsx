import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { errorMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberOptionProps } from '../../types/member'
import MemberSelector from './MemberSelector'

const ContentCreatorSelector: React.FC<{
  value?: string
  onChange?: (value: string | null) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { loading, error, members } = useContentCreatorCollection()

  if (loading) {
    return <Spin />
  }

  if (error || !members) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  return (
    <MemberSelector
      members={members}
      value={value}
      onChange={value => typeof value === 'string' && onChange && onChange(value)}
    />
  )
}

const useContentCreatorCollection = () => {
  const { data, loading, error } = useQuery<types.GET_CONTENT_CREATOR_COLLECTION>(
    gql`
      query GET_CONTENT_CREATOR_COLLECTION {
        member(where: { role: { _in: ["content-creator", "app-owner"] } }) {
          id
          picture_url
          name
          username
          email
        }
      }
    `,
  )

  const members: MemberOptionProps[] =
    loading || error || !data
      ? []
      : data.member.map(member => ({
          id: member.id,
          avatarUrl: member.picture_url,
          name: member.name || member.username,
          username: member.username,
          email: member.email,
        }))

  return {
    loading,
    members,
    error,
  }
}

export default ContentCreatorSelector
