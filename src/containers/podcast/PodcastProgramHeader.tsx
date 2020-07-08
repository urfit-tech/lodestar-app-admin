import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppContext from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'

const PodcastProgramHeader: React.FC<{
  podcastProgramId: string
  title?: string | null
  noPreview?: boolean
  goBackLink?: string | null
}> = ({ podcastProgramId, title, noPreview, goBackLink }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { settings } = useContext(AppContext)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => (goBackLink ? history.push(goBackLink) : history.goBack())} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{title || podcastProgramId}</AdminHeaderTitle>

      {!noPreview && (
        <a href={`https://${settings['host']}/podcasts/${podcastProgramId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      )}
    </AdminHeader>
  )
}

export default PodcastProgramHeader
