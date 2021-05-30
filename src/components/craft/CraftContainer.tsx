import { useNode } from '@craftjs/core'
import React from 'react'

const CraftContainer: React.FC<{ background?: string; padding: number }> = ({
  background = 'transparent',
  padding = 0,
  children,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={ref => ref && connect(drag(ref))} style={{ margin: '5px 0', background, padding: `${padding}px` }}>
      {children}
    </div>
  )
}

export default CraftContainer
