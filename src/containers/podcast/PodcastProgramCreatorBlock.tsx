import React, { useContext } from 'react'
import RoleAdminBlock from '../../components/admin/RoleAdminBlock'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { usePublicMember } from '../../hooks/member'

const PodcastProgramCreatorBlock: React.FC = () => {
  const { podcastProgram } = useContext(PodcastProgramContext)
  const { member } = usePublicMember(podcastProgram?.creatorId || '')

  if (!member) {
    return null
  }

  return <RoleAdminBlock name={member.name} pictureUrl={member.pictureUrl} />
}

export default PodcastProgramCreatorBlock
