import { Editor, Element, Frame } from '@craftjs/core'
import { Tabs } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as PageIcon } from '../../images/icon/page.svg'
import { ReactComponent as BrushIcon } from '../../images/icon/paintbrush.svg'
import CraftActionsPanel from './CraftActionsPannel'
import CraftBackground from './CraftBackground'
import CraftButton from './CraftButton'
import CraftCard from './CraftCard'
import CraftCarousel from './CraftCarousel'
import CraftCollapse from './CraftCollapse'
import CraftContainer from './CraftContainer'
import CraftDataSelector from './CraftDataSelector'
import CraftImage from './CraftImage'
import CraftLayout from './CraftLayout'
import CraftParagraph from './CraftParagraph'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftStatistics from './CraftStatistics'
import CraftTitle from './CraftTitle'
import CraftTitleAndParagraph from './CraftTitleAndParagraph'
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
                <Element is={CraftContainer} padding={10} canvas setActiveKey={setActiveKey}>
                  <CraftLayout
                    mobile={{ padding: 25, columnAmount: 5, columnRatio: [3, 3, 3], displayAmount: 6 }}
                    desktop={{ padding: 50, columnAmount: 3, columnRatio: [2, 2, 2], displayAmount: 3 }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftTitle
                    titleContent="文字標題"
                    fontSize={20}
                    padding={5}
                    textAlign="center"
                    fontWeight="bold"
                    color="#585858"
                    setActiveKey={setActiveKey}
                  />
                  <CraftParagraph
                    paragraphContent="文字段落"
                    fontSize={20}
                    padding={5}
                    lineHeight={1}
                    textAlign="left"
                    fontWeight="bold"
                    color="#faacff"
                    setActiveKey={setActiveKey}
                  />
                  <CraftTitleAndParagraph
                    title={{
                      titleContent: '文字段落 (常見問題 02)',
                      fontSize: 20,
                      padding: 3,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#fcd89d',
                    }}
                    paragraph={{
                      paragraphContent: '',
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                      textAlign: 'left',
                      fontWeight: 'normal',
                      color: '#cccdff',
                    }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftButton
                    title="按鈕"
                    link="https://demo.com"
                    openNewTab={true}
                    size="lg"
                    block={false}
                    variant="solid"
                    color="#cfc"
                    setActiveKey={setActiveKey}
                  />
                  <CraftCarousel
                    type="normal"
                    covers={[
                      {
                        title: '輪播 banner01',
                        paragraph: 'content',
                        desktopCoverUrl: 'desktop',
                        mobileCoverUrl: 'mobile',
                        link: 'link',
                        openNewTab: false,
                      },
                    ]}
                    titleStyle={{
                      fontSize: 10,
                      padding: 3,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#c8c858',
                    }}
                    paragraphStyle={{
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                      textAlign: 'left',
                      fontWeight: 'normal',
                      color: '#cccdff',
                    }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftCarousel
                    type="simply"
                    covers={[
                      { title: '輪播 banner01', desktopCoverUrl: '', mobileCoverUrl: '', link: '', openNewTab: false },
                    ]}
                    setActiveKey={setActiveKey}
                  />
                  <CraftImage
                    type="image"
                    padding={0}
                    margin={{ m: '3;2;4;2' }}
                    coverUrl="https://static-dev.kolable.com/program_covers/demo/f2733181-180b-466a-8f10-555441679cd7?t=1625721391323"
                    setActiveKey={setActiveKey}
                  />
                  <CraftStatistics
                    type="image"
                    padding={0}
                    margin={{ m: '3;2;4;2' }}
                    coverUrl="https://static-dev.kolable.com/program_covers/demo/f2733181-180b-466a-8f10-555441679cd7?t=1625721391323"
                    title={{
                      titleContent: '數值 (數值01、數值02)',
                      fontSize: 12,
                      padding: 3,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#585858',
                    }}
                    paragraph={{
                      paragraphContent: '',
                      fontSize: 12,
                      padding: 3,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#585858',
                    }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftCard
                    type="feature"
                    backgroundImageUrl=""
                    imageType="empty"
                    imageUrl=""
                    boxModel={{
                      padding: 6,
                      margin: { m: '4;3;2;3' },
                    }}
                    title="卡片 特色02"
                    titleStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    cardPadding={20}
                    cardMargin={{ m: '3;2;3;1' }}
                    variant="none"
                    backgroundType="none"
                    setActiveKey={setActiveKey}
                  />
                  <CraftCard
                    type="featureWithParagraph"
                    backgroundImageUrl=""
                    imageType="empty"
                    imageUrl=""
                    boxModel={{
                      padding: 6,
                      margin: { m: '4;3;2;3' },
                    }}
                    title="卡片 特色01"
                    titleStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    paragraph="卡片 特色01"
                    paragraphStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    cardPadding={20}
                    cardMargin={{ m: '3;2;3;1' }}
                    variant="none"
                    backgroundType="none"
                    setActiveKey={setActiveKey}
                  />
                  <CraftCard
                    type="referrer"
                    backgroundImageUrl=""
                    imageType="empty"
                    imageUrl=""
                    boxModel={{
                      padding: 6,
                      margin: { m: '4;3;2;3' },
                    }}
                    title="卡片 推薦評價01"
                    titleStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    paragraph="卡片 推薦評價01"
                    paragraphStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    cardPadding={20}
                    cardMargin={{ m: '3;2;3;1' }}
                    variant="none"
                    outlineColor="green"
                    backgroundType="none"
                    solidColor="#cfaacf"
                    setActiveKey={setActiveKey}
                  />
                  <CraftCard
                    type="referrerReverse"
                    backgroundImageUrl=""
                    imageType="empty"
                    imageUrl=""
                    boxModel={{
                      padding: 6,
                      margin: { m: '4;3;2;3' },
                    }}
                    name=""
                    title="卡片 推薦評價02"
                    titleStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    paragraph="卡片 推薦評價02"
                    paragraphStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    cardPadding={20}
                    cardMargin={{ m: '3;2;3;1' }}
                    variant="none"
                    backgroundType="none"
                    setActiveKey={setActiveKey}
                  />
                  <CraftCollapse
                    title="手風琴"
                    titleStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    paragraph=""
                    paragraphStyle={{
                      fontSize: 16,
                      padding: 5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'blue',
                    }}
                    cardPadding={20}
                    cardMargin={{ m: '3;2;3;1' }}
                    variant="none"
                    backgroundType="none"
                    setActiveKey={setActiveKey}
                  />
                  <CraftBackground
                    backgroundType="none"
                    padding={4}
                    margin={{ m: '3;4;2;2' }}
                    setActiveKey={setActiveKey}
                  />
                  <CraftDataSelector setActiveKey={setActiveKey}>資料選擇</CraftDataSelector>
                </Element>
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
