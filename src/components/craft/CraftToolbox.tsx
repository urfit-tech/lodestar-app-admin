import { Element, useEditor } from '@craftjs/core'
import { Button } from 'antd'
import React from 'react'
import CraftCard from './CraftCard'
import CraftContainer from './CraftContainer'

const CraftToolbox: React.VFC = () => {
  const { connectors } = useEditor()
  return (
    <div className="px-3 mb-3">
      <Button
        className="mb-2"
        block
        ref={ref => ref && connectors.create(ref, <Element is={CraftContainer} padding={20} canvas />)}
      >
        Container
      </Button>
      <Button block ref={ref => ref && connectors.create(ref, <CraftCard text="Sample" programId="xxx" />)}>
        Sample Card
      </Button>
    </div>
  )
}

export default CraftToolbox
