import { CloseOutlined } from '@ant-design/icons'
import { Editor, Element, Frame } from '@craftjs/core'
import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminHeader, AdminHeaderTitle, AdminTabBarWrapper } from '../../../components/admin'
import CraftActionsPanel from '../../../components/craft/CraftActionsPannel'
import CraftCard from '../../../components/craft/CraftCard'
import CraftContainer from '../../../components/craft/CraftContainer'
import CraftSettingsPanel from '../../../components/craft/CraftSettingsPanel'
import CraftToolbox from '../../../components/craft/CraftToolbox'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import { useApp } from '../../../contexts/AppContext'
import { commonMessages, craftPageMessages } from '../../../helpers/translation'
import { ReactComponent as PageIcon } from '../../../images/icon/page.svg'
import { ReactComponent as BrushIcon } from '../../../images/icon/paintbrush.svg'

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
const StyledSider = styled.div`
  flex: 3;
  height: 100vh;
  overflow-y: scroll;
  position: relative;
`
const StyledTabBarWrapper = styled.div`
  .ant-tabs-tab {
    margin-left: 1.5em;
  }
`
const StyledPageIcon = styled(PageIcon)<{ activeSiderKey: string }>`
  font-size: 21px;
  g {
    fill: ${props => (props.activeSiderKey === 'component' ? props.theme['@primary-color'] : '#585858')};
  }
`
const StyledBrushIcon = styled(BrushIcon)<{ activeSiderKey: string }>`
  font-size: 21px;
  path {
    fill: ${props => (props.activeSiderKey === 'settings' ? props.theme['@primary-color'] : '#585858')};
  }
`

const StyledTabsPane = styled(Tabs.TabPane)`
  background: #ffffff;
`
const StyledButton = styled(Button)`
  position: absolute;
`

const CraftPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const [activeSiderKey, setActiveSiderKey] = useState('component')

  return (
    <>
      <AdminHeader>
        <Link to="admin/craft_page">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{formatMessage(craftPageMessages.label.craftPageEditor)}</AdminHeaderTitle>

        <a href={`https://${settings['host']}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'editor'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="editor" tab={formatMessage(craftPageMessages.label.editPage)}>
            <div>
              <Editor resolver={{ CraftCard, CraftContainer }}>
                <div className="d-flex mb-3">
                  <StyledScrollBar>
                    <StyledContent>
                      <Frame>
                        <Element is={CraftContainer} padding={5} background="#eee" canvas>
                          <CraftCard text="TEST" programId="7ca21659-f825-4220-8cad-2d5b93dc42b7" />
                          <CraftCard text="TEST2" programId="8dc0e6e8-632d-4b2f-8623-bf5e37149f5b" />
                          <Element is={CraftContainer} padding={5} background="#eee" canvas>
                            <CraftCard text="TEST inner" programId="403a6927-4b36-448e-9260-606d2a4a2b0e" />
                          </Element>
                          <CraftCard text="TEST3" programId="c7a519d8-c7cc-4985-be35-f7d41da15473" />
                        </Element>
                      </Frame>
                      <CraftActionsPanel />
                    </StyledContent>
                  </StyledScrollBar>
                  <StyledSider>
                    <Tabs
                      activeKey={activeSiderKey || 'component'}
                      onChange={key => setActiveSiderKey(key)}
                      renderTabBar={(props, DefaultTabBar) => (
                        <StyledTabBarWrapper style={{ background: '#ffffff' }}>
                          <DefaultTabBar {...props} className="mb-0" />
                        </StyledTabBarWrapper>
                      )}
                    >
                      <StyledTabsPane key="component" tab={<StyledPageIcon activeSiderKey={activeSiderKey} />}>
                        <CraftToolbox />
                      </StyledTabsPane>
                      <StyledTabsPane key="settings" tab={<StyledBrushIcon activeSiderKey={activeSiderKey} />}>
                        <CraftSettingsPanel />
                      </StyledTabsPane>
                    </Tabs>
                    <StyledButton type="primary" onClick={() => {}}>
                      {formatMessage(commonMessages.ui.save)}
                    </StyledButton>
                  </StyledSider>
                </div>
              </Editor>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="general" tab={formatMessage(craftPageMessages.label.settings)}>
            基本設定
          </Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(craftPageMessages.label.publish)}>
            發佈
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default CraftPage
