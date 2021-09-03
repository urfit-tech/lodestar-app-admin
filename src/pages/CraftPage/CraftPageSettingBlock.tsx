import { Editor, Element, Frame } from '@craftjs/core'
import { Tabs } from 'antd'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftButton from 'lodestar-app-element/src/components/craft/CraftButton'
import CraftCard from 'lodestar-app-element/src/components/craft/CraftCard'
import CraftCarousel from 'lodestar-app-element/src/components/craft/CraftCarousel'
import CraftCollapse from 'lodestar-app-element/src/components/craft/CraftCollapse'
import CraftContainer from 'lodestar-app-element/src/components/craft/CraftContainer'
import CraftDataSelector from 'lodestar-app-element/src/components/craft/CraftDataSelector'
import CraftImage from 'lodestar-app-element/src/components/craft/CraftImage'
import CraftLayout from 'lodestar-app-element/src/components/craft/CraftLayout'
import CraftParagraph from 'lodestar-app-element/src/components/craft/CraftParagraph'
import CraftStatistics from 'lodestar-app-element/src/components/craft/CraftStatistics'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import CraftTitleAndParagraph from 'lodestar-app-element/src/components/craft/CraftTitleAndParagraph'
import React, { useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as PageIcon } from '../../images/icon/page.svg'
import { ReactComponent as BrushIcon } from '../../images/icon/paintbrush.svg'
import CraftActionsPanel from './CraftActionsPanel'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftToolbox from './CraftToolbox'

const StyledScrollBar = styled.div`
  flex: 12;
  height: 100vh;
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
const StyledContent = styled.div`
  margin: 40px;
`
const StyledTabs = styled(Tabs)`
  flex: 3;
  height: 100vh;
  overflow-y: scroll;
`
const StyledPageIcon = styled(PageIcon)<{ active: string }>`
  font-size: 21px;
  g {
    fill: ${props => (props.active === 'component' ? props.theme['@primary-color'] : '#585858')};
  }
`
const StyledBrushIcon = styled(BrushIcon)<{ active: string }>`
  font-size: 21px;
  path {
    fill: ${props => (props.active === 'settings' ? props.theme['@primary-color'] : '#585858')};
  }
`

const StyledTabsPane = styled(Tabs.TabPane)`
  background: #ffffff;
  .ant-tabs-content-holder {
    background: #ffffff;
  }
`
const StyledTabBarWrapper = styled.div`
  background: #ffffff;

  .ant-tabs-tab {
    margin: 1em 1.5em;
    padding: 0 0;
  }
`

const CraftPageSettingBlock: React.VFC = () => {
  const [activeKey, setActiveKey] = useState('component')

  return (
    <>
      <Editor
        resolver={{
          CraftContainer,
          CraftLayout,
          CraftTitle,
          CraftParagraph,
          CraftTitleAndParagraph,
          CraftButton,
          CraftCarousel,
          CraftStatistics,
          CraftImage,
          CraftCard,
          CraftCollapse,
          CraftBackground,
          CraftDataSelector,
        }}
      >
        <div className="d-flex">
          <StyledScrollBar>
            <StyledContent>
              <Frame>
                <Element is={CraftContainer} margin={{}} canvas></Element>
              </Frame>
              <CraftActionsPanel />
            </StyledContent>
          </StyledScrollBar>
          <StyledTabs
            style={{ position: 'relative' }}
            activeKey={activeKey || 'component'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <StyledTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </StyledTabBarWrapper>
            )}
          >
            <StyledTabsPane key="component" tab={<StyledPageIcon active={activeKey} />}>
              <CraftToolbox />
            </StyledTabsPane>
            <StyledTabsPane key="settings" tab={<StyledBrushIcon active={activeKey} />}>
              <CraftSettingsPanel />
            </StyledTabsPane>
          </StyledTabs>
        </div>
      </Editor>
    </>
  )
}

export default CraftPageSettingBlock
