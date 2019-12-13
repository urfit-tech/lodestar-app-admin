import { Icon } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AvatarImage } from '../../components/common/Image'

const StyledSubTitle = styled.h2`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledCreatorName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
  text-overflow: ellipsis;
`
const StyledIcon = styled(Icon)`
  color: ${props => props.theme['@primary-color']};
`

const PopularPodcastCollection: React.FC = () => {
  // ! fake data
  const creators: {
    id: string
    avatarUrl?: string | null
    name: string
  }[] = [
    {
      id: 'creator-1',
      name: '王琳琳',
    },
    {
      id: 'creator-2',
      name: 'Mary Wang',
    },
    {
      id: 'creator-3',
      name: 'Lorem ipsum dolor sit amet consectetur',
    },
    {
      id: 'creator-4',
      name: '王琳琳',
    },
    {
      id: 'creator-5',
      name: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident aliquam odio quia',
    },
  ]

  return (
    <div>
      <StyledSubTitle className="mb-4">熱門訂閱頻道</StyledSubTitle>

      {creators.map(creator => (
        <Link
          key={creator.id}
          to={`/creators/${creator.id}`}
          className="d-flex align-items-center justify-content-between mb-3"
        >
          <AvatarImage size={64} src={creator.avatarUrl} className="flex-shrink-0 mr-4" />
          <StyledCreatorName className="flex-grow-1 mr-3">{creator.name}</StyledCreatorName>
          <StyledIcon type="right" />
        </Link>
      ))}
    </div>
  )
}

export default PopularPodcastCollection
