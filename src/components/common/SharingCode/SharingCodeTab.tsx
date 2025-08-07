import React from 'react'
import { useIntl } from 'react-intl'
import { AdminBlock, AdminPaneDescription, AdminPaneTitle } from '../../admin'
import commonMessages from '../translation'
import SharingCodeAdminForm from './SharingCodeAdminForm'

const SharingCodeTab: React.FC<{
  typePath: string
  target: string
}> = ({ typePath, target }) => {
  const { formatMessage } = useIntl()
  return (
    <div className="container py-5">
      <AdminPaneTitle>{formatMessage(commonMessages.SharingCode.title)}</AdminPaneTitle>
      <AdminPaneDescription className="mb-4">
        {formatMessage(commonMessages.SharingCode.description)}
      </AdminPaneDescription>
      <AdminBlock>
        <SharingCodeAdminForm typePath={typePath} target={target} />
      </AdminBlock>
    </div>
  )
}

export default SharingCodeTab
