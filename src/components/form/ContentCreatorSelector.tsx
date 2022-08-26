import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { errorMessages } from '../../helpers/translation'
import { MemberOptionProps } from '../../types/member'
import MemberSelector from './MemberSelector'

const ContentCreatorSelector: React.FC<{
  value?: string
  onChange?: (value: string | null) => void
  allowedPermission?: string
}> = ({ value, onChange, allowedPermission }) => {
  const { formatMessage } = useIntl()

  const condition: hasura.GET_CONTENT_CREATOR_COLLECTIONVariables['condition'] = allowedPermission
    ? {
        _or: [
          { role: { _in: ['content-creator', 'app-owner'] } },
          { member_permissions: { permission_id: { _eq: allowedPermission } } },
        ],
      }
    : { role: { _in: ['content-creator', 'app-owner'] } }

  const { loading, error, members } = useContentCreatorCollection(condition)

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

const useContentCreatorCollection = (condition: hasura.GET_CONTENT_CREATOR_COLLECTIONVariables['condition']) => {
  const { data, loading, error } = useQuery<
    hasura.GET_CONTENT_CREATOR_COLLECTION,
    hasura.GET_CONTENT_CREATOR_COLLECTIONVariables
  >(
    gql`
      query GET_CONTENT_CREATOR_COLLECTION($condition: member_bool_exp!) {
        member(where: $condition) {
          id
          picture_url
          name
          username
          email
        }
      }
    `,
    {
      variables: { condition },
    },
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
