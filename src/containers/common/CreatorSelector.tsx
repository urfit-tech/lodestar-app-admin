import { useQuery } from '@apollo/react-hooks'
import { Spin } from 'antd'
import gql from 'graphql-tag'
import React, { forwardRef, useContext } from 'react'
import { useIntl } from 'react-intl'
import MemberSelector, { MemberOptionProps } from '../../components/common/MemberSelector'
import AppContext from '../../contexts/AppContext'
import { errorMessages } from '../../helpers/translation'
import types from '../../types'

const CreatorSelector: React.FC<{
  value?: string
  onChange?: (value: string | null) => void
  zoomUserOnly?: boolean
}> = ({ value, onChange, zoomUserOnly }, ref) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const { loading, error, data } = useQuery<types.GET_CREATOR_COLLECTION, types.GET_CREATOR_COLLECTIONVariables>(
    GET_CREATOR_COLLECTION,
    {
      variables: {
        appId: app.id,
        noZoomUserId: zoomUserOnly ? !zoomUserOnly : undefined,
      },
    },
  )

  if (loading) {
    return <Spin />
  }

  if (error || !data) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const members: MemberOptionProps[] = data.member.map(member => ({
    id: member.id,
    avatarUrl: member.picture_url,
    name: member.name || member.username,
    username: member.username,
    email: member.email,
    disabled: zoomUserOnly && !member.zoom_user_id,
  }))

  return <MemberSelector ref={ref} members={members} value={value} onChange={onChange} />
}

const GET_CREATOR_COLLECTION = gql`
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
`

export default forwardRef(CreatorSelector)
