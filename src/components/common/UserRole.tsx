import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { UserRole } from '../../types/general'
import { ProgramRoleName } from '../../types/program'

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

export const ProgramRoleLabel: React.FC<{ role: ProgramRoleName | string | null }> = ({ role }) => {
  const { formatMessage } = useIntl()

  switch (role) {
    case 'owner':
      return <>{formatMessage(commonMessages.term.owner)}</>
    case 'instructor':
      return <>{formatMessage(commonMessages.term.instructor)}</>
    case 'assistant':
      return <>{formatMessage(commonMessages.term.teachingAssistant)}</>
    default:
      return <>{formatMessage(commonMessages.term.unknownRole)}</>
  }
}
