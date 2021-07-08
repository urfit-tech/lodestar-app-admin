import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, InputNumber, Slider } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel } from '../admin'

type CraftContainerProps = { padding: number }

const CraftContainer: UserComponent<
  CraftContainerProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }
> = ({ padding, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={ref => ref && connect(drag(ref))} onClick={() => setActiveKey('settings')}>
      {children}
    </div>
  )
}

const ContainerSettings: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftContainerProps,
    button: node.data.custom.button,
  }))
  const [padding, setPadding] = useState(props.padding)

  return (
    <Collapse
      {...collapseProps}
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['container']}
    >
      <StyledCollapsePanel
        key="container"
        header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.containerComponent)}</AdminHeaderTitle>}
      >
        <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.padding)}</StyledCraftSettingLabel>
        <div className="col-12 d-flex justify-content-center align-items-center mb-2 p-0">
          <div className="col-8 p-0">
            <Slider value={typeof padding === 'number' ? padding : 0} onChange={(value: number) => setPadding(value)} />
          </div>
          <InputNumber className="col-4" value={padding} onChange={value => setPadding(Number(value))} />
        </div>
        <Button
          className="mb-3"
          type="primary"
          block
          onClick={() => setProp((props: CraftContainerProps) => (props.padding = padding))}
        >
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </StyledCollapsePanel>
    </Collapse>
  )
}

CraftContainer.craft = {
  related: {
    settings: ContainerSettings,
  },
  custom: {
    button: {
      label: 'deleteBlock',
    },
  },
}

export default CraftContainer
