import { useEditor } from '@craftjs/core'
import { Button } from 'antd'
import React from 'react'

const CraftSettingsPanel: React.VFC = () => {
  const { selected, query, actions } = useEditor(state => {
    const currentNodeId = state.events.selected
    let selected
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
      }
    }

    return {
      selected,
    }
  })
  return (
    <div className="px-3">
      {selected && selected.settings && React.createElement(selected.settings)}
      {selected && (
        <Button danger block onClick={() => actions.delete(selected.id)}>
          DELETE
        </Button>
      )}
    </div>
  )
}

export default CraftSettingsPanel
