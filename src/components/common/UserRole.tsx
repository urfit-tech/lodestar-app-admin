import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { UserRole } from '../../types/member'
import { ProgramRoleName } from '../../types/program'

export const UserRoleName: React.FC<{
  userRole: UserRole | string | null
}> = ({ userRole }) => {
  const { formatMessage } = useIntl()

  switch (userRole) {
    case 'anonymous':
      return <>{formatMessage(commonMessages.label.anonymousUser)}</>
    case 'general-member':
      return <>{formatMessage(commonMessages.label.generalMember)}</>
    case 'content-creator':
      return <>{formatMessage(commonMessages.label.contentCreator)}</>
    case 'app-owner':
      return <>{formatMessage(commonMessages.label.appOwner)}</>
    default:
      return <>{formatMessage(commonMessages.label.unknownRole)}</>
  }
}

export const ProgramRoleLabel: React.FC<{
  role: ProgramRoleName | string | null
}> = ({ role }) => {
  const { formatMessage } = useIntl()

  switch (role) {
    case 'owner':
      return <>{formatMessage(commonMessages.label.owner)}</>
    case 'instructor':
      return <>{formatMessage(commonMessages.label.instructor)}</>
    case 'assistant':
      return <>{formatMessage(commonMessages.label.teachingAssistant)}</>
    default:
      return <>{formatMessage(commonMessages.label.unknownRole)}</>
  }
}
