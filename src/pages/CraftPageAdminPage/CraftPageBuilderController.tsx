import { DesktopOutlined, MobileOutlined, RedoOutlined, TabletOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, useToast } from '@chakra-ui/react'
import { useEditor } from '@craftjs/core'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { Device } from '../../types/general'
import pageMessages from '../translation'
import CraftPageBuilderContext from './CraftPageBuilderContext'

const CraftPageBuilderController: React.FC<{
  pageId: string
  initialDevice?: Device | null
  onAppPageUpdate?: () => void
}> = ({ pageId, initialDevice, onAppPageUpdate }) => {
  const editor = useEditor(state => ({ nodes: state.nodes }))
  const [loading, setLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInitialDevice, setIsInitialDevice] = useState(false)
  const { device, onDeviceChange } = useContext(CraftPageBuilderContext)
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { updateAppPage } = useMutateAppPage()
  const theme = useAppTheme()
  const toast = useToast()

  useEffect(() => {
    if (!isSaved) return
    handleSave()
  }, [isSaved])

  if (!isInitialDevice) {
    initialDevice && onDeviceChange?.(initialDevice)
    setIsInitialDevice(true)
  }

  const handleSave = () => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    toast.closeAll()
    updateAppPage({
      pageId,
      editorId: currentMemberId,
      craftData: JSON.parse(editor.query.serialize()),
    })
      .then(() => {
        toast({
          title: formatMessage(commonMessages.event.successfullySaved),
          status: 'success',
          duration: 1500,
          position: 'top',
        })
        editor.actions.history.clear()
      })
      .catch(handleError)
      .finally(() => {
        onAppPageUpdate?.()
        setIsSaved(false)
        setLoading(false)
      })
  }

  const handleDeviceChange = (device: Device) => {
    for (const nodeId in editor.nodes) {
      if (Object.prototype.hasOwnProperty.call(editor.nodes, nodeId)) {
        editor.actions.setCustom(nodeId, custom => {
          custom.device = device
        })
      }
    }
    onDeviceChange?.(device)
  }

  const activeColor = theme['@primary-color'] || '#4C5B8F'
  const inactiveColor = 'var(--gray)'
  return (
    <div className="d-flex align-items-center">
      <DesktopOutlined
        title={formatMessage(pageMessages.CraftPageBuilderController.desktop)}
        style={{ color: device === 'desktop' ? activeColor : inactiveColor }}
        className="mr-2"
        onClick={() => {
          handleDeviceChange('desktop')
          setIsSaved(true)
        }}
      />
      <TabletOutlined
        title={formatMessage(pageMessages.CraftPageBuilderController.tablet)}
        style={{ color: device === 'tablet' ? activeColor : inactiveColor }}
        className="mr-2"
        onClick={() => {
          handleDeviceChange('tablet')
          setIsSaved(true)
        }}
      />
      <MobileOutlined
        title={formatMessage(pageMessages.CraftPageBuilderController.mobile)}
        style={{ color: device === 'mobile' ? activeColor : inactiveColor }}
        className="mr-3"
        onClick={() => {
          handleDeviceChange('mobile')
          setIsSaved(true)
        }}
      />

      <UndoOutlined
        className="mr-2"
        style={{
          cursor: editor.query.history.canUndo() ? 'pointer' : 'not-allowed',
          color: editor.query.history.canUndo() ? activeColor : inactiveColor,
        }}
        disabled={!editor.query.history.canUndo()}
        onClick={() => editor.actions.history.undo()}
      />
      <RedoOutlined
        className="mr-3"
        style={{
          cursor: editor.query.history.canRedo() ? 'pointer' : 'not-allowed',
          color: editor.query.history.canRedo() ? activeColor : inactiveColor,
        }}
        onClick={() => editor.actions.history.redo()}
      />
      <Button
        className="mr-2"
        isLoading={loading}
        colorScheme="primary"
        borderRadius="0.25rem"
        disabled={!editor.query.history.canUndo()}
        onClick={() => handleSave()}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </div>
  )
}

export default CraftPageBuilderController
