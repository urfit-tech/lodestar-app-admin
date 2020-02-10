import React from 'react'
import { useIntl } from 'react-intl'
import { UserRole } from '../schemas/general'
import { commonMessages } from './translation'

export const UserRoleName: React.FC<{ userRole: UserRole | string | null }> = ({ userRole }) => {
  const { formatMessage } = useIntl()

  switch (userRole) {
    case 'anonymous':
      return <>{formatMessage(commonMessages.term.anonymousUser)}</>
    case 'general-member':
      return <>{formatMessage(commonMessages.term.generalMember)}</>
    case 'content-creator':
      return <>{formatMessage(commonMessages.term.contentCreator)}</>
    case 'app-owner':
      return <>{formatMessage(commonMessages.term.appOwner)}</>
    default:
      return <>{formatMessage(commonMessages.term.unknownRole)}</>
  }
}
