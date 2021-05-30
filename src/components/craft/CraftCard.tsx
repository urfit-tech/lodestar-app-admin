// components/user/Card.js
import { useNode, UserComponent } from '@craftjs/core'
import { Button, Card, Input } from 'antd'
import React, { useState } from 'react'
import ContentEditable from 'react-contenteditable'
import { useProgram } from '../../hooks/program'

type CraftCardProps = { text: string; programId: string }
const CraftCard: UserComponent<CraftCardProps> = ({ text, programId }) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode(node => ({
    selected: node.events.selected,
    dragged: node.events.dragged,
  }))

  const { program } = useProgram(programId)
  return (
    <div ref={ref => ref && connect(drag(ref))}>
      <Card
        title={
          <ContentEditable
            html={text}
            onChange={e => setProp(props => (props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, '')))}
            tagName="p"
          />
        }
      >
        {program?.title}
      </Card>
    </div>
  )
}

const CardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftCardProps,
  }))
  const [programId, setProgramId] = useState(props.programId)
  return (
    <div>
      <span>Program ID</span>
      <Input className="mb-2" type="text" value={programId} onChange={e => setProgramId(e.target.value)} />
      <Button
        className="mb-1"
        type="primary"
        block
        onClick={() => setProp((props: CraftCardProps) => (props.programId = programId))}
      >
        Save
      </Button>
    </div>
  )
}

CraftCard.craft = {
  related: {
    settings: CardSettings,
  },
}

export default CraftCard
