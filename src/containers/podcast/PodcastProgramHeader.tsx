import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'

const PodcastProgramHeader: React.FC<{
  podcastProgramId: string
}> = ({ podcastProgramId }) => {
  const { history } = useRouter()
  const { podcastProgram } = useContext(PodcastProgramContext)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => history.goBack()} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{podcastProgram ? podcastProgram.title : podcastProgramId}</AdminHeaderTitle>
    </AdminHeader>
  )
}

export default PodcastProgramHeader
