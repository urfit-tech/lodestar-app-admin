import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'

const PodcastProgramHeader: React.FC<{
  podcastProgramId: string
}> = ({ podcastProgramId }) => {
  const { history } = useRouter()
  const app = useContext(AppContext)
  const { podcastProgram } = useContext(PodcastProgramContext)
  const { currentMemberId } = useAuth()

  return (
    <AdminHeader>
      <Button type="link" onClick={() => history.goBack()} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{podcastProgram ? podcastProgram.title : podcastProgramId}</AdminHeaderTitle>
      <a
        href={`https://${app.domain}/creators/${currentMemberId}?tabkey=appointments`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>預覽</Button>
      </a>
    </AdminHeader>
  )
}

export default PodcastProgramHeader
