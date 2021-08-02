import { useEditor } from '@craftjs/core'
import { Button } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import React, { useState } from 'react'

const CraftActionsPanel: React.VFC = () => {
  const {
    query,
    actions: { deserialize },
  } = useEditor()
  const [serializedState, setSerializedState] = useState('')

  return (
    <div>
      <div className="d-flex mb-2">
        <Button
          className="mr-2"
          onClick={() => {
            setSerializedState(query.serialize())
          }}
        >
          Serialize
        </Button>
        <Button
          onClick={() => {
            deserialize(serializedState)
          }}
        >
          Load
        </Button>
      </div>
      <TextArea rows={10} value={serializedState} onChange={e => setSerializedState(e.target.value)}></TextArea>
    </div>
  )
}

export default CraftActionsPanel
