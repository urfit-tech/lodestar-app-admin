import { Element, Frame, useEditor } from '@craftjs/core'
import { Button, Tabs } from 'antd'
import { CraftSection } from 'lodestar-app-element/src/components/common/CraftElement'
import React, { useContext, useEffect, useState } from 'react'
import ReactStyleEditor, { stringify as stringifyStyle } from 'react-style-editor'
import ReactStyledFrame from 'react-styled-frame'
import styled from 'styled-components'
import { CraftPageAdminProps } from '../../types/craft'
import { Device } from '../../types/general'
import CraftPageBuilderContext from './CraftPageBuilderContext'
import CraftPageBuilderLayer from './CraftPageBuilderLayer'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftToolbox from './CraftToolBox'

const StyledContent = styled.div`
  display: flex;
  height: calc(100vh - 64px - 49px);
`
const StyledPreviewBlock = styled.div`
  flex: 1;
  overflow: auto;
`
const CraftSettingTabs = styled(Tabs)`
  padding: 0 16px;
  width: 320px;
  height: 100%;
  border-right: 1px solid var(--gray);

  .ant-tabs-content-holder {
    overflow: auto;
  }
`

const StyledFrame = styled(ReactStyledFrame)<{ device?: Device }>`
  width: ${props => (props.device === 'mobile' ? '420px' : props.device === 'tablet' ? '720px' : '100%')};
  height: 100%;
  margin: auto;
  background-color: white;
  overflow-x: hidden;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    -webkit-appearance: none;
  }
  ::-webkit-scrollbar:vertical {
    width: 11px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    border: 2px solid white;
    background-color: rgba(0, 0, 0, 0.5);
  }
`

const SettingBlockToggleButton = styled(Button)<{ active?: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => (props.active ? '320px' : '0px')};
  border: 1px solid var(--gray);
  border-left: none;
`

const CraftPageBuilderBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps
  onAppPageUpdate?: () => void
}> = ({ pageAdmin, onAppPageUpdate }) => {
  const [active, setActive] = useState(true)
  const { rootStyle, actions } = useEditor(state => {
    return { rootStyle: state.nodes['ROOT']?.data?.custom?.style || [] }
  })
  return (
    <StyledContent>
      <CraftSettingsPanel />
      <SettingBlockToggleButton active={active} onClick={() => setActive(!active)}>
        {active ? '<' : '>'}
      </SettingBlockToggleButton>
      {active && (
        <CraftSettingTabs defaultActiveKey="toolbox">
          <Tabs.TabPane tab="Toolbox" key="toolbox">
            <CraftToolbox />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Layer" key="layer">
            <CraftPageBuilderLayer />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Style" key="style">
            <ReactStyleEditor
              outputFormats="machine"
              value={stringifyStyle(rootStyle)}
              onChange={(style: unknown[]) => {
                actions.setCustom('ROOT', custom => {
                  custom.style = style
                })
              }}
            />
          </Tabs.TabPane>
        </CraftSettingTabs>
      )}
      <StyledPreviewBlock>
        <PreviewFrame data={pageAdmin?.craftData} />
      </StyledPreviewBlock>
    </StyledContent>
  )
}

const PreviewFrame: React.VFC<{ data: { [key: string]: string } | null }> = ({ data }) => {
  const { device } = useContext(CraftPageBuilderContext)
  const [headInnerHTML, setHeadInnerHTML] = useState<string>(document.head.innerHTML)
  const { rootStyle } = useEditor(state => {
    return { rootStyle: state.nodes['ROOT']?.data?.custom?.style || [] }
  })
  useEffect(() => {
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        setHeadInnerHTML((mutation.target as HTMLHeadElement).innerHTML)
      })
    })
    mutationObserver.observe(document.head, { childList: true })
    return () => mutationObserver.disconnect()
  }, [])
  return (
    <StyledFrame device={device}>
      {headInnerHTML && <div dangerouslySetInnerHTML={{ __html: headInnerHTML }}></div>}
      <style>{stringifyStyle(rootStyle)}</style>
      <Frame data={data ? JSON.stringify(data) : undefined}>
        <Element is={CraftSection} customStyle={{ padding: 40 }} canvas />
      </Frame>
    </StyledFrame>
  )
}

export default CraftPageBuilderBlock
