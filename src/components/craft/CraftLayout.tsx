import { useNode, UserComponent } from '@craftjs/core'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftLayoutProps } from '../../types/craft'
import { StyledSettingButtonWrapper } from '../admin'
import { BREAK_POINT } from '../common/Responsive'
import CraftLayoutBlock from './CraftLayoutBlock'

const StyledContainer = styled.div<{ mobile: CraftLayoutProps; desktop: CraftLayoutProps }>`
  padding: ${props => `${props.mobile.padding}px`};

  @media (min-width: ${BREAK_POINT}px) {
    padding: ${props => `${props.desktop.padding}px`};
  }
`

type FieldProps = {
  desktop: CraftLayoutProps
  mobile: CraftLayoutProps
}

const CraftLayout: UserComponent<{
  mobile: CraftLayoutProps
  desktop: CraftLayoutProps
  setActiveKey: React.Dispatch<React.SetStateAction<string>>
}> = ({ mobile, desktop, setActiveKey }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <StyledContainer
      ref={ref => ref && connect(drag(ref))}
      mobile={mobile}
      desktop={desktop}
      style={{ cursor: 'pointer' }}
      onClick={() => setActiveKey('settings')}
    >
      layout
    </StyledContainer>
  )
}

const LayoutSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as FieldProps,
    selected: node.events.selected,
  }))

  const handleSubmit = (value: FieldProps) => {
    setProp((props: FieldProps) => {
      props.desktop = {
        padding: value.desktop.padding,
        columnAmount: value.desktop.columnAmount,
        columnRatio: value.desktop.columnRatio,
        displayAmount: value.desktop.displayAmount,
      }
      props.mobile = {
        padding: value.mobile.padding,
        columnAmount: value.mobile.columnAmount,
        columnRatio: value.mobile.columnRatio,
        displayAmount: value.mobile.displayAmount,
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
        desktop: {
          padding: props.desktop.padding || 0,
          columnAmount: props.desktop.columnAmount || 3,
          columnRatio: props.desktop.columnRatio || [3, 3, 3],
          displayAmount: props.desktop.displayAmount || 3,
        },
        mobile: {
          padding: props.mobile.padding || 0,
          columnAmount: props.mobile.columnAmount || 3,
          columnRatio: props.mobile.columnRatio || [3, 3, 3],
          displayAmount: props.mobile.displayAmount || 3,
        },
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="desktop">
        <CraftLayoutBlock title={formatMessage(craftPageMessages.label.desktopLayoutComponent)} />
      </Form.Item>
      <Form.Item name="mobile">
        <CraftLayoutBlock title={formatMessage(craftPageMessages.label.mobileLayoutComponent)} />
      </Form.Item>
      {selected && (
        <StyledSettingButtonWrapper>
          <Button type="primary" block htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </StyledSettingButtonWrapper>
      )}
    </Form>
  )
}

CraftLayout.craft = {
  related: {
    settings: LayoutSettings,
  },
}

export default CraftLayout
