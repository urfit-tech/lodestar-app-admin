import { useEditor } from '@craftjs/core'
import { Button } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'

const CraftSettingsPanel: React.VFC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const { formatMessage } = useIntl()
  const {
    query: { node },
    selected,
    actions,
  } = useEditor(state => {
    const currentNodeId = state.events.selected
    let selected
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        labelName: state.nodes[currentNodeId].data?.custom?.button?.label,
      }
    }
    return {
      selected,
    }
  })

  return (
    <div className="px-3 mb-4">
      {selected && selected.settings && React.createElement(selected.settings)}
      {selected && selected.labelName && (
        <Button
          block
          onClick={() => {
            if (node(selected.id).isRoot()) {
              return
            }
            if (window.confirm(formatMessage(craftPageMessages.text.deleteWarning))) {
              actions.delete(selected.id)
              onDelete?.()
            }
          }}
        >
          {selected.labelName === 'deleteBlock'
            ? formatMessage(craftPageMessages.ui.deleteBlock)
            : formatMessage(craftPageMessages.ui.deleteAllBlock)}
        </Button>
      )}
    </div>
  )
}

export default CraftSettingsPanel
