import React from 'react'
import CreatorCardComponents, { CreatorCardProps } from '../../components/common/CreatorCard'

const CreatorCard: React.FC<{
  id: string
}> = ({ id }) => {
  // ! fake data
  const creator: CreatorCardProps = {
    id,
    avatarUrl:
      'https://images.unsplash.com/photo-1574617850931-d582af3c12d7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1351&q=80',
    title: '王小美',
    labels: [
      {
        id: 'instructor',
        name: '老師',
      },
    ],
    description: '擅長將企劃整合廣告、數位行銷、數位媒體等面向給品牌主最全面的解決方案給品牌主最全面的解決方案給品牌',
    withPodcast: true,
    withReservation: true,
  }

  return <CreatorCardComponents {...creator} />
}

export default CreatorCard
