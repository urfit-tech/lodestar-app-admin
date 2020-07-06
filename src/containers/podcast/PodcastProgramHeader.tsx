import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppContext from '../../contexts/AppContext'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { commonMessages } from '../../helpers/translation'

const PodcastProgramHeader: React.FC<{
  podcastProgramId: string
}> = ({ podcastProgramId }) => {
  const { history } = useRouter()
  const app = useContext(AppContext)
  const { podcastProgram } = useContext(PodcastProgramContext)
  const { formatMessage } = useIntl()

  return (
    <AdminHeader>
      <Link to="/podcast-programs">
        <Button type="link" className="mr-3">
          <Icon type="arrow-left" />
        </Button>
      </Link>
      <AdminHeaderTitle>{podcastProgram ? podcastProgram.title : podcastProgramId}</AdminHeaderTitle>
      <a
        href={`https://${app.settings['host']}/podcasts/${podcastProgramId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>{formatMessage(commonMessages.ui.preview)}</Button>
      </a>
    </AdminHeader>
  )
}

export default PodcastProgramHeader
