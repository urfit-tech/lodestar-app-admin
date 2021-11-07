import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { Layers } from '@craftjs/layers'
import { useContext } from 'react'
import styled from 'styled-components'
import CraftPageBuilderContext from './CraftPageBuilderContext'

const StyledLayerLabel = styled.div`
  display: flex;
  justify-content: end;
  cursor: pointer;
  background-color: var(--gray);
`
const CraftPageBuilderLayer: React.VFC = () => {
  const { showLayer, onLayerToggle } = useContext(CraftPageBuilderContext)
  return (
    <div>
      <StyledLayerLabel className="px-3 py-2" onClick={() => onLayerToggle?.()}>
        {showLayer ? <CloseOutlined /> : <MenuOutlined />}
      </StyledLayerLabel>
      {showLayer && <Layers expandRootOnLoad />}
    </div>
  )
}

export default CraftPageBuilderLayer
