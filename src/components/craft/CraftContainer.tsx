import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, Form } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftPaddingProps } from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledSettingButtonWrapper } from '../admin'
import CraftBoxModelInput from './CraftBoxModelInput'

type FieldProps = { padding: CraftPaddingProps }

const CraftContainer: UserComponent<
  FieldProps & {
    setActiveKey: React.Dispatch<React.SetStateAction<string>>
  }
> = ({ padding, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={ref => ref && connect(drag(ref))}
      style={{
        padding: `${padding.pt}px ${padding.pr}px ${padding.pb}px ${padding.pl}px`,
        cursor: 'pointer',
      }}
      onClick={() => setActiveKey('settings')}
    >
      {children}
    </div>
  )
}

const ContainerSettings: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as FieldProps,
    button: node.data.custom.button,
    selected: node.events.selected,
  }))

  const handleSubmit = (values: FieldProps) => {
    setProp(props => {
      props.padding = {
        pt: values.padding.pt,
        pr: values.padding.pr,
        pb: values.padding.pb,
        pl: values.padding.pl,
      }
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
          <Form.Item name="padding">
            <CraftBoxModelInput edgeType="padding" />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>

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
