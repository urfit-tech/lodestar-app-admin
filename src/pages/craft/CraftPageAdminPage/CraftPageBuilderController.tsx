import { RedoOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { useEditor } from '@craftjs/core'
import { message, Tag } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../../helpers/translation'
import { useMutateAppPage } from '../../../hooks/appPage'
import CraftPageBuilderContext from './CraftPageBuilderContext'

const messages = defineMessages({
  desktop: { id: 'craft.settings.responsiveSelector.desktop', defaultMessage: '桌面' },
  tablet: { id: 'craft.settings.responsiveSelector.tablet', defaultMessage: '平板' },
  mobile: { id: 'craft.settings.responsiveSelector.mobile', defaultMessage: '手機' },
})
const CraftPageBuilderController: React.FC<{ pageId: string }> = ({ pageId }) => {
  const editor = useEditor()
  const [loading, setLoading] = useState(false)
  const { device, onDeviceChange } = useContext(CraftPageBuilderContext)
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { updateAppPage } = useMutateAppPage()

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

  return (
    <div
      className="d-flex align-items-center justify-content-between px-3"
      style={{ height: '40px', backgroundColor: 'var(--gray-light)' }}
    >
      <div className="d-flex">
        <Tag.CheckableTag className="mr-1" checked={device === 'desktop'} onClick={() => onDeviceChange?.('desktop')}>
          {formatMessage(messages.desktop)}
        </Tag.CheckableTag>
        <Tag.CheckableTag className="mr-1" checked={device === 'tablet'} onClick={() => onDeviceChange?.('tablet')}>
          {formatMessage(messages.tablet)}
        </Tag.CheckableTag>
        <Tag.CheckableTag checked={device === 'mobile'} onClick={() => onDeviceChange?.('mobile')}>
          {formatMessage(messages.mobile)}
        </Tag.CheckableTag>
      </div>
      <div className="d-flex">
        <UndoOutlined
          className="mr-2"
          disabled={!editor.query.history.canUndo()}
          onClick={() => editor.actions.history.undo()}
        />
        <RedoOutlined
          className="mr-2"
          disabled={!editor.query.history.canRedo()}
          onClick={() => editor.actions.history.redo()}
        />
        <SaveOutlined onClick={() => handleSave()} />
      </div>
    </div>
  )
}

export default CraftPageBuilderController
