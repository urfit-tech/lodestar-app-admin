import { CloseOutlined, DragOutlined } from '@ant-design/icons'
import { useEditor } from '@craftjs/core'
import { Collapse, Input, Slider } from 'antd'
import { PropsWithCraft } from 'lodestar-app-element/src/components/common/Craftize'
import React from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'

export type CraftSettingsProps<P> = Omit<PropsWithCraft<P>, 'responsive'>
export type CraftElementSettings<P = any> = React.ElementType<{
  props: CraftSettingsProps<P>
  onPropsChange?: (changedProps: CraftSettingsProps<P>) => void
}>

export const StyledPanel = styled.div`
  position: fixed;
  width: 400px;
  height: 70vh;
  background-color: white;
  border: 1px solid var(--gray);
  overflow: auto;
`
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

export const StyledCollapsePanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    padding-left: 0px !important;
  }
  /* .ant-collapse-content-box {
    padding: 0px !important;
  } */
`

const CraftSettingsPanel: React.VFC = () => {
  const editor = useEditor(state => ({
    currentNode: state.events.selected ? state.nodes[state.events.selected] : null,
  }))
  return (
    <Draggable handle=".draggable" defaultPosition={{ x: 200, y: 32 }}>
      <StyledPanel style={{ display: editor.currentNode?.data.custom?.editing ? 'block' : 'none' }}>
        <div
          className="d-flex align-items-center justify-content-between mb-2 draggable cursor-pointer p-3"
          style={{ backgroundColor: 'var(--gray-light)' }}
        >
          <h3 className="d-flex align-items-center">
            <DragOutlined className="mr-2" />
            <span>{editor.currentNode?.data.displayName}</span>
          </h3>
          <CloseOutlined
            onClick={() =>
              editor.currentNode &&
              editor.actions.setCustom(editor.currentNode.id, custom => {
                custom.editing = false
              })
            }
          />
        </div>
        <div className="px-3">
          {editor.currentNode?.related.settings
            ? React.createElement(editor.currentNode?.related.settings)
            : 'Please select an element.'}
        </div>
      </StyledPanel>
    </Draggable>
  )
}

export default CraftSettingsPanel
