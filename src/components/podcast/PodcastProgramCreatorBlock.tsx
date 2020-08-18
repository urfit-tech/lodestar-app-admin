import React from 'react'
import { usePublicMember } from '../../hooks/member'
import { PodcastProgramAdminProps } from '../../types/podcast'
import RoleAdminBlock from '../admin/RoleAdminBlock'

const PodcastProgramCreatorBlock: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
}> = ({ podcastProgramAdmin }) => {
  const { member } = usePublicMember(podcastProgramAdmin?.creatorId || '')

  if (!member) {
    return null
  }

  return <RoleAdminBlock name={member.name} pictureUrl={member.pictureUrl} />
}

export default PodcastProgramCreatorBlock
