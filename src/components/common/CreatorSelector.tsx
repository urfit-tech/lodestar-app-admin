import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React, { forwardRef, useContext } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { errorMessages } from '../../helpers/translation'
import types from '../../types'
import MemberSelector, { MemberOptionProps } from './MemberSelector'

const CreatorSelector: React.FC<{
  value?: string
  onChange?: (value: string | null) => void
  zoomUserOnly?: boolean
}> = ({ value, onChange, zoomUserOnly }, ref) => {
  const { formatMessage } = useIntl()
  const { loading, error, members } = useGetCreatorCollection(zoomUserOnly)

  if (loading) {
    return <Spin />
  }

  if (error || !members) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  return <MemberSelector ref={ref} members={members} value={value} onChange={onChange} />
}

const useGetCreatorCollection = (zoomUserOnly?: boolean) => {
  const { id: appId } = useContext(AppContext)

  const { data, loading, error } = useQuery<types.GET_CREATOR_COLLECTION, types.GET_CREATOR_COLLECTIONVariables>(
    gql`
      query GET_CREATOR_COLLECTION($appId: String!, $noZoomUserId: Boolean) {
        member(
          where: {
            app_id: { _eq: $appId }
            role: { _in: ["content-creator", "app-owner"] }
            zoom_user_id: { _is_null: $noZoomUserId }
          }
        ) {
          id
          picture_url
          name
          username
          email
          zoom_user_id
        }
      }
    `,
    {
      variables: {
        appId,
        noZoomUserId: zoomUserOnly ? !zoomUserOnly : undefined,
      },
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
          disabled: zoomUserOnly && !member.zoom_user_id,
        }))

  return {
    loading,
    members,
    error,
  }
}

export default forwardRef(CreatorSelector)
