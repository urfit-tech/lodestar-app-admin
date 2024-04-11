import { DesktopOutlined, MobileOutlined, RedoOutlined, TabletOutlined, UndoOutlined } from '@ant-design/icons'
import { useEditor } from '@craftjs/core'
import { Button, message } from 'antd'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { Device } from '../../types/general'
import CraftPageBuilderContext from './CraftPageBuilderContext'

const messages = defineMessages({
  desktop: { id: 'craft.settings.responsiveSelector.desktop', defaultMessage: '桌面' },
  tablet: { id: 'craft.settings.responsiveSelector.tablet', defaultMessage: '平板' },
  mobile: { id: 'craft.settings.responsiveSelector.mobile', defaultMessage: '手機' },
})

const CraftPageBuilderController: React.FC<{ pageId: string }> = ({ pageId }) => {
  const editor = useEditor(state => ({ nodes: state.nodes }))
  const [loading, setLoading] = useState(false)
  const { device, onDeviceChange } = useContext(CraftPageBuilderContext)
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { updateAppPage } = useMutateAppPage()
  const theme = useAppTheme()

  const handleSave = () => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId,
      editorId: currentMemberId,
      craftData: JSON.parse(editor.query.serialize()),
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        editor.actions.history.clear()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
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
        style={{ color: device === 'desktop' ? activeColor : inactiveColor }}
        className="mr-2"
        onClick={() => handleDeviceChange('desktop')}
      />
      <TabletOutlined
        style={{ color: device === 'tablet' ? activeColor : inactiveColor }}
        className="mr-2"
        onClick={() => handleDeviceChange('tablet')}
      />
      <MobileOutlined
        style={{ color: device === 'mobile' ? activeColor : inactiveColor }}
        className="mr-3"
        onClick={() => handleDeviceChange('mobile')}
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
        loading={loading}
        type="primary"
        className="mr-2"
        disabled={!editor.query.history.canUndo()}
        onClick={() => handleSave()}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </div>
  )
}

export default CraftPageBuilderController
