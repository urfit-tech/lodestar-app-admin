import { Layers } from '@craftjs/layers'
import styled from 'styled-components'

const StyledLayerLabel = styled.div`
  display: flex;
  justify-content: end;
  cursor: pointer;
  background-color: var(--gray);
`
const CraftPageBuilderLayer: React.VFC = () => {
  return <Layers expandRootOnLoad />
}

export default CraftPageBuilderLayer
