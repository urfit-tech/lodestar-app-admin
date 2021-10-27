import { useEditor, useNode } from '@craftjs/core'
import { Button, Collapse, Form, Input, Slider, Tabs } from 'antd'
import { PropsWithCraft } from 'lodestar-app-element/src/components/common/Craftize'
import React from 'react'
import Draggable from 'react-draggable'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import BoxModelInput from '../inputs/BoxModelInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'

export type CraftSettings<P> = React.ElementType<{
  props: PropsWithCraft<P>
  onPropsChange?: (props: PropsWithCraft<P>) => void
}>
export const withResponsive = <P extends object>(WrappedSettings: CraftSettings<P>) => {
  const THROTTLE_RATE = 500
  const mergePropsIntoProxy = (props: { [key: string]: any }, proxy: any) => {
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        proxy[key] = props[key]
      }
    }
  }
  const StyledTabs = styled(Tabs)`
    border: 1px solid lightgrey;
    margin-bottom: 8px;
    padding: 0 16px 8px 16px;
    && {
      .ant-tabs-content {
        max-height: 70vh;
        overflow: auto;
      }
    }
  `
  const ResponsiveSettings: React.VFC = () => {
    const {
      actions: { selectNode },
    } = useEditor()
    const {
      title,
      props,
      actions: { setProp },
    } = useNode(node => ({
      title: node.data.name,
      props: node.data.props as PropsWithCraft<P>,
      selected: node.events.selected,
    }))

    return (
      <StyledTabs
        defaultActiveKey="desktop"
        tabBarExtraContent={{
          left: <h3 className="draggable cursor-pointer mr-3">{title}</h3>,
          right: <button onClick={() => selectNode()}>X</button>,
        }}
      >
        <Tabs.TabPane tab="desktop" key="desktop">
          <WrappedSettings
            props={{ ...props, ...props.responsive?.desktop }}
            onPropsChange={changedProps =>
              setProp(proxy => {
                proxy.responsive = {
                  ...proxy.responsive,
                  desktop: changedProps,
                }
              }, THROTTLE_RATE)
            }
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="tablet" key="tablet">
          <WrappedSettings
            props={{ ...props, ...props.responsive?.tablet }}
            onPropsChange={changedProps =>
              setProp(proxy => {
                proxy.responsive = {
                  ...proxy.responsive,
                  tablet: changedProps,
                }
              }, THROTTLE_RATE)
            }
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="mobile" key="mobile">
          <WrappedSettings
            props={props}
            onPropsChange={changedProps =>
              setProp(proxy => {
                mergePropsIntoProxy(changedProps, proxy)
              }, THROTTLE_RATE)
            }
          />
        </Tabs.TabPane>
      </StyledTabs>
    )
  }
  return ResponsiveSettings
}

export const CraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
  margin-bottom: 4px;
`
export const CraftSlider = styled(Slider)`
  .ant-slider-track {
    background-color: ${props => props.theme['@primary-color'] || '#000'};
  }
`
export const StyledSettingButtonWrapper = styled.div`
  position: absolute;
  top: 0.5em;
  right: 0.5em;
`
export const StyledUnderLineInput = styled(Input)`
  border-color: #d8d8d8;
  border-style: solid;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 1px;
  border-left-width: 0px;
  :hover {
    border-right-width: 0px !important;
    border-color: #d8d8d8;
  }
`

type SettingProps = {
  title: string
  label?: string
  value?: string
  onChange?: (value: string) => void
}

export const CraftCollapseSetting: React.VFC<
  (
    | {
        variant: 'textarea'
        placeholder?: string
      }
    | {
        variant: 'slider'
        placeholder?: never
      }
  ) &
    SettingProps
> = ({ variant, placeholder, title, label, value, onChange }) => {
  return (
    <Collapse className="mt-2 p-0" bordered={false} expandIconPosition="right" ghost defaultActiveKey={['key']}>
      <StyledCollapsePanel key="key" header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
        <div className="mb-2">
          {variant === 'textarea' && (
            <>
              {label && <CraftSettingLabel>{label}</CraftSettingLabel>}
              <Input.TextArea
                className="mt-2"
                rows={5}
                placeholder={placeholder}
                defaultValue={value}
                onChange={e => onChange?.(e.target.value)}
              />
            </>
          )}
          {variant === 'slider' && <BoxModelInput title={label} value={value} onChange={onChange} />}
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export const TextSettingsPanel: React.VFC<{ title: string; key: string }> = ({ title, key }) => {
  return (
    <StyledCollapsePanel key={key} header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
      <Form.Item name={`${key}.spaceStyle`}>
        <SpaceStyleInput />
      </Form.Item>
      <Form.Item name={`${key}.borderStyle`}>
        <BorderStyleInput />
      </Form.Item>
      <Form.Item name={`${key}.backgroundStyle`}>
        <BackgroundStyleInput />
      </Form.Item>
    </StyledCollapsePanel>
  )
}

export const CraftSettingsModal: React.VFC = () => {
  const { formatMessage } = useIntl()
  const {
    query: { node },
    selectedNode,
    NodeSettings,
    actions,
  } = useEditor(state => {
    const selectedNode = state.events.selected ? state.nodes[state.events.selected] : null
    return {
      selectedNode,
      NodeSettings: selectedNode?.related?.settings,
    }
  })
  return selectedNode ? (
    <Draggable handle=".draggable" defaultPosition={{ x: -200, y: 32 }}>
      <div
        style={{
          background: 'white',
          position: 'fixed',
          width: 400,
          zIndex: 999,
        }}
      >
        {NodeSettings && React.createElement(NodeSettings)}
        {!node(selectedNode.id).isRoot() && (
          <Button
            block
            danger
            onClick={() => {
              if (window.confirm(formatMessage(craftPageMessages.text.deleteWarning))) {
                actions.delete(selectedNode.id)
              }
            }}
          >
            {formatMessage(craftPageMessages.ui.deleteBlock)}
          </Button>
        )}
      </div>
    </Draggable>
  ) : null
}

export const StyledCollapsePanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    padding-left: 0px !important;
  }
  /* .ant-collapse-content-box {
    padding: 0px !important;
  } */
`
