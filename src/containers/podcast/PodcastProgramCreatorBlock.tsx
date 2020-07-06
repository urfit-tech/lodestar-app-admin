import React from 'react'
import RoleAdminBlock from '../../components/admin/RoleAdminBlock'
import { usePublicMember } from '../../hooks/member'
import { PodcastProgramProps } from '../../types/podcast'

const PodcastProgramCreatorBlock: React.FC<{
  podcastProgram: PodcastProgramProps | null
}> = ({ podcastProgram }) => {
  const { member } = usePublicMember(podcastProgram?.creatorId || '')

  if (!member) {
    return null
  }

  return <RoleAdminBlock name={member.name} pictureUrl={member.pictureUrl} />
}

export default PodcastProgramCreatorBlock
