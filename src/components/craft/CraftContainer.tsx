import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, Form, InputNumber, Slider } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel, StyledSettingButtonWrapper } from '../admin'

type FieldProps = { padding: number }

const CraftContainer: UserComponent<{
  padding: number
  setActiveKey: React.Dispatch<React.SetStateAction<string>>
}> = ({ padding, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={ref => ref && connect(drag(ref))}
      style={{ padding: `${padding}px`, cursor: 'pointer' }}
      onClick={() => setActiveKey('settings')}
    >
      {children}
    </div>
  )
}

const ContainerSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as { padding: number },
    button: node.data.custom.button,
    selected: node.events.selected,
  }))

  const handleSubmit = (values: { padding: number }) => {
    setProp(props => {
      props.padding = values.padding
    })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{
        padding: props.padding,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="padding">
        <PaddingBlock />
      </Form.Item>
      {selected && (
        <StyledSettingButtonWrapper>
          <Button className="mb-3" type="primary" htmlType="submit" block>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </StyledSettingButtonWrapper>
      )}
    </Form>
  )
}

const PaddingBlock: React.VFC<{ value?: number; onChange?: (value?: number) => void } & CollapseProps> = ({
  value,
  onChange,
  ...collapseProps
}) => {
  const { formatMessage } = useIntl()

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
        <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.boundary)}</StyledCraftSettingLabel>
        <div className="col-12 d-flex justify-content-center align-items-center mb-2 p-0">
          <div className="col-8 p-0">
            <Slider value={typeof value === 'number' ? value : 0} onChange={(v?: number) => onChange && onChange(v)} />
          </div>
          <InputNumber className="col-4" value={value} onChange={v => onChange && onChange(Number(v))} />
        </div>
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
