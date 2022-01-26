import { createContext, useState } from 'react'
import { Device } from '../../types/general'

type CraftPageBuilderContextValue = {
  device: Device
  showLayer?: boolean
  onDeviceChange?: (device: Device) => void
  onLayerToggle?: () => void
}
const defaultContext: CraftPageBuilderContextValue = {
  device: 'desktop',
}
const CraftPageBuilderContext = createContext(defaultContext)

export const CraftPageBuilderProvider: React.FC = ({ children }) => {
  const [showLayer, setShowLayer] = useState<CraftPageBuilderContextValue['showLayer']>(defaultContext.showLayer)
  const [device, setDevice] = useState<CraftPageBuilderContextValue['device']>(defaultContext.device)
  return (
    <CraftPageBuilderContext.Provider
      value={{
        device,
        showLayer,
        onLayerToggle: () => setShowLayer(!showLayer),
        onDeviceChange: value => setDevice(value),
      }}
    >
      {children}
    </CraftPageBuilderContext.Provider>
  )
}
export default CraftPageBuilderContext
