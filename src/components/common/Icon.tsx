import React from 'react'

type IconProps = {
  name: string
}
const Icon: React.FC<IconProps> = ({ name }) => {
  return <i className={`icon-${name}`} style={{ fontSize: '10rem' }} />
}
