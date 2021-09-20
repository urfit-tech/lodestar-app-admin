import { Editor, Element, Frame, useEditor } from '@craftjs/core'
import { Button, message, Tabs } from 'antd'
import CraftActivity from 'lodestar-app-element/src/components/craft/CraftActivity'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftButton from 'lodestar-app-element/src/components/craft/CraftButton'
import CraftCard from 'lodestar-app-element/src/components/craft/CraftCard'
import CraftCarousel from 'lodestar-app-element/src/components/craft/CraftCarousel'
import CraftCarouselContainer from 'lodestar-app-element/src/components/craft/CraftCarouselContainer'
import CraftCollapse from 'lodestar-app-element/src/components/craft/CraftCollapse'
import CraftContainer from 'lodestar-app-element/src/components/craft/CraftContainer'
import CraftImage from 'lodestar-app-element/src/components/craft/CraftImage'
import CraftInstructor from 'lodestar-app-element/src/components/craft/CraftInstructor'
import CraftLayout from 'lodestar-app-element/src/components/craft/CraftLayout'
import CraftParagraph from 'lodestar-app-element/src/components/craft/CraftParagraph'
import CraftPodcastProgram from 'lodestar-app-element/src/components/craft/CraftPodcastProgram'
import CraftProgram from 'lodestar-app-element/src/components/craft/CraftProgram'
import CraftProject from 'lodestar-app-element/src/components/craft/CraftProject'
import CraftStatistics from 'lodestar-app-element/src/components/craft/CraftStatistics'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import CraftTitleAndParagraph from 'lodestar-app-element/src/components/craft/CraftTitleAndParagraph'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import ActivitySettings from '../../components/craftSetting/ActivitySettings'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { ReactComponent as PageIcon } from '../../images/icon/page.svg'
import { ReactComponent as BrushIcon } from '../../images/icon/paintbrush.svg'
import { CraftPageAdminProps } from '../../types/craft'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftToolbox from './CraftToolbox'

const messages = defineMessages({
  saveAndUpdate: { id: 'project.ui.saveAndUpdate', defaultMessage: '儲存並更新' },
})

const StyledScrollBar = styled.div`
  flex: 12;
  height: calc(100vh - 64px - 49px);
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
const StyledSettingBlock = styled.div`
  flex: 4;
  height: calc(100vh - 113px);
`
const StyledContent = styled.div`
  /* padding: 20px;
  background: #eee; */
`
const StyledTabs = styled(Tabs)`
  width: 100%;
  height: 100vh;
  min-width: 300px;
  position: relative;
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
  height: calc(100vh - 64px - 49px - 60px);
  overflow-y: scroll;
  background: #ffffff;
  .ant-tabs-content-holder {
    background: #ffffff;
  }
`
const StyledTabBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 1rem;
  background: #ffffff;

  .ant-tabs-tab {
    margin: 1em 1.5em;
    padding: 0 0;
  }
`

const CraftPageSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const [activeKey, setActiveKey] = useState('component')

  return (
    <Editor resolver={configureResolver()}>
      <div className="d-flex">
        <StyledScrollBar>
          <StyledContent>
            <div style={{ height: 'auto', background: 'white' }} onClick={() => setActiveKey('settings')}>
              <Frame data={pageAdmin?.craftData ? JSON.stringify(pageAdmin.craftData) : undefined}>
                <Element is={CraftContainer} margin={{}} padding={{ pb: '40', pt: '40', pr: '40', pl: '40' }} canvas />
              </Frame>
            </div>
          </StyledContent>
        </StyledScrollBar>
        <SettingBlock pageId={pageAdmin?.id} activeKey={activeKey} setActiveKey={setActiveKey} onRefetch={onRefetch} />
      </div>
    </Editor>
  )
}

const SettingBlock: React.VFC<{
  pageId?: string
  activeKey: string
  setActiveKey: React.Dispatch<React.SetStateAction<string>>
  onRefetch?: () => void
}> = ({ pageId, activeKey, setActiveKey, onRefetch }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const { updateAppPage } = useMutateAppPage()
  const { isDataChanged, actions, query } = useEditor((state, query) => ({
    isDataChanged: query.history.canUndo(),
  }))
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!currentMemberId || !pageId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId,
      editorId: currentMemberId,
      craftData: JSON.parse(query.serialize()),
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
        actions.history.clear()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <StyledSettingBlock>
      <StyledTabs
        activeKey={activeKey || 'component'}
        onChange={key => setActiveKey(key)}
        renderTabBar={(props, DefaultTabBar) => (
          <StyledTabBarWrapper>
            <DefaultTabBar {...props} className="mb-0" />
            <Button disabled={!isDataChanged} loading={loading} type="primary" onClick={handleSubmit}>
              {formatMessage(messages.saveAndUpdate)}
            </Button>
          </StyledTabBarWrapper>
        )}
      >
        <StyledTabsPane key="component" tab={<StyledPageIcon active={activeKey} />}>
          <CraftToolbox />
        </StyledTabsPane>
        <StyledTabsPane key="settings" tab={<StyledBrushIcon active={activeKey} />}>
          <CraftSettingsPanel onDelete={() => setActiveKey('component')} />
        </StyledTabsPane>
      </StyledTabs>
    </StyledSettingBlock>
  )
}

const configureResolver = () => {
  CraftActivity.craft = {
    related: {
      settings: ActivitySettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }

  return {
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
    CraftProgram,
    CraftProject,
    CraftActivity,
    CraftPodcastProgram,
    CraftInstructor,
    CraftCarouselContainer,
  }
}

export default CraftPageSettingBlock
