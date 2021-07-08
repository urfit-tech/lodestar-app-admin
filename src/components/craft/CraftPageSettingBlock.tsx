import { Editor, Element, Frame } from '@craftjs/core'
import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as PageIcon } from '../../images/icon/page.svg'
import { ReactComponent as BrushIcon } from '../../images/icon/paintbrush.svg'
import CraftActionsPanel from './CraftActionsPannel'
import CraftCarousel from './CraftCarousel'
import CraftContainer from './CraftContainer'
import CraftLayout from './CraftLayout'
import CraftParagraphTypeA from './CraftParagraphTypeA'
import CraftParagraphTypeB from './CraftParagraphTypeB'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftTitle from './CraftTitle'
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
const StyledTabBarWrapper = styled.div`
  background: #ffffff;
  position: relative;
  .ant-tabs-tab {
    padding: 1em 1em;
  }
  .ant-tabs-tab:first-child {
    margin-left: 1em;
    margin-right: 0.5em;
  }
  .ant-tabs-tab:last-child {
    margin-right: 1em;
  }
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
`
const StyledButton = styled(Button)`
  position: absolute;
  top: 0.5em;
  right: 2em;
`

const CraftPageSettingBlock: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [activeKey, setActiveKey] = useState('component')

  return (
    <>
      <Editor resolver={{ CraftContainer, CraftLayout, CraftTitle }}>
        <div className="d-flex">
          <StyledScrollBar>
            <StyledContent>
              <Frame>
                <Element is={CraftContainer} padding={5} canvas setActiveKey={setActiveKey}>
                  {/* <CraftCard text="TEST inner" programId="403a6927-4b36-448e-9260-606d2a4a2b0e" /> */}
                  <CraftLayout
                    mobile={{ padding: 5, columnAmount: 5, columnRatio: [3, 3, 3], displayAmount: 6 }}
                    desktop={{ padding: 2, columnAmount: 3, columnRatio: [2, 2, 2], displayAmount: 3 }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftTitle
                    titleContent=""
                    fontSize={12}
                    padding={3}
                    textAlign="center"
                    fontWeight="bold"
                    color="#585858"
                    setActiveKey={setActiveKey}
                  />
                  <CraftParagraphTypeA
                    paragraphContent=""
                    fontSize={14}
                    padding={0}
                    lineHeight={1}
                    textAlign="left"
                    fontWeight="normal"
                    color="#cccccc"
                    setActiveKey={setActiveKey}
                  />
                  <CraftParagraphTypeB
                    title={{
                      titleContent: '',
                      fontSize: 12,
                      padding: 3,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#585858',
                    }}
                    paragraph={{
                      paragraphContent: '',
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                      textAlign: 'left',
                      fontWeight: 'normal',
                      color: '#cccccc',
                    }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftCarousel cover={[{ title: '', content: '' }]} style={{}} setActiveKey={setActiveKey} />
                </Element>
              </Frame>
              <CraftActionsPanel />
            </StyledContent>
          </StyledScrollBar>
          <StyledTabs
            activeKey={activeKey || 'component'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <StyledTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
                <StyledButton type="primary" onClick={() => {}}>
                  {formatMessage(commonMessages.ui.save)}
                </StyledButton>
              </StyledTabBarWrapper>
            )}
          >
            <StyledTabsPane key="component" tab={<StyledPageIcon active={activeKey} />}>
              <CraftToolbox setActiveKey={setActiveKey} />
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
