import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppContext from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'

const PodcastProgramHeader: React.FC<{
  podcastProgramId: string
  title?: string | null
  noPreview?: boolean
}> = ({ podcastProgramId, title, noPreview }) => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const app = useContext(AppContext)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => history.goBack()} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{title || podcastProgramId}</AdminHeaderTitle>

      {!noPreview && (
        <a
          href={`https://${app.settings['host']}/podcasts/${podcastProgramId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      )}
    </AdminHeader>
  )
}

export default PodcastProgramHeader
