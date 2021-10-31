import { useEditor } from '@craftjs/core'
import { Collapse, Input, Slider, Tabs } from 'antd'
import { PropsWithCraft } from 'lodestar-app-element/src/components/common/Craftize'
import React from 'react'
import Draggable from 'react-draggable'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

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
    const editor = useEditor(state => ({
      currentNode: state.events.selected ? state.nodes[state.events.selected] : null,
    }))
    if (!editor.currentNode) {
      return null
    }
    const { responsive, ...currentProps } = editor.currentNode.data.props as PropsWithCraft<P>
    return (
      <StyledTabs
        defaultActiveKey="desktop"
        tabBarExtraContent={{
          left: <h3 className="draggable cursor-pointer mr-3">{editor.currentNode.data.name}</h3>,
          right: (
            <button
              onClick={() => {
                editor.currentNode &&
                  editor.actions.setCustom(editor.currentNode.id, custom => {
                    custom.editing = false
                  })
                editor.actions.selectNode()
              }}
            >
              X
            </button>
          ),
        }}
      >
        <Tabs.TabPane tab="desktop" key="desktop">
          <WrappedSettings
            props={{ ...currentProps, ...responsive?.desktop } as PropsWithCraft<P>}
            onPropsChange={changedProps =>
              editor.currentNode &&
              editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
                proxy.responsive = {
                  ...proxy.responsive,
                  desktop: changedProps,
                }
              })
            }
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="tablet" key="tablet">
          <WrappedSettings
            props={{ ...currentProps, ...responsive?.tablet } as PropsWithCraft<P>}
            onPropsChange={changedProps =>
              editor.currentNode &&
              editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
                proxy.responsive = {
                  ...proxy.responsive,
                  tablet: changedProps,
                }
              })
            }
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="mobile" key="mobile">
          <WrappedSettings
            props={currentProps as PropsWithCraft<P>}
            onPropsChange={changedProps =>
              editor.currentNode &&
              editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
                mergePropsIntoProxy(changedProps, proxy)
              })
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

export const CraftSettingsModal: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentNode } = useEditor(state => ({
    currentNode: state.events.selected ? state.nodes[state.events.selected] : null,
  }))
  return currentNode?.data.custom?.editing ? (
    <Draggable handle=".draggable" defaultPosition={{ x: -200, y: 32 }}>
      <div
        style={{
          background: 'white',
          position: 'fixed',
          width: 400,
          zIndex: 999,
        }}
      >
        {currentNode.related?.settings && React.createElement(currentNode.related.settings)}
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
