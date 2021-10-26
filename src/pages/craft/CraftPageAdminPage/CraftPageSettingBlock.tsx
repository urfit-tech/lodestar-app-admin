import { Editor, Element, Frame, useEditor } from '@craftjs/core'
import { Button, message, Tabs } from 'antd'
import { CraftSection } from 'lodestar-app-element/src/components/common/CraftElement'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { configureResolver, CraftToolBox } from '../../../components/craft'
import { CraftToolboxCategory } from '../../../components/craft/CraftToolBox'
import { CraftSettingsModal } from '../../../components/craft/settings/CraftSettings'
import { handleError } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { useMutateAppPage } from '../../../hooks/appPage'
import { ReactComponent as PageIcon } from '../../../images/icon/page.svg'
import { CraftPageAdminProps } from '../../../types/craft'

const messages = defineMessages({
  settings: { id: 'appPage.ui.settings', defaultMessage: '元件設定' },
  saveAndUpdate: { id: 'appPage.ui.saveAndUpdate', defaultMessage: '儲存並更新' },
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
const StyledPageIcon = styled(PageIcon)<{ active?: boolean }>`
  font-size: 21px;
  g {
    fill: ${props => (props.active ? props.theme['@primary-color'] : '#585858')};
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
  const resolver = configureResolver()
  return (
    <Editor resolver={resolver}>
      <div className="d-flex">
        <StyledScrollBar>
          <StyledContent>
            <div style={{ height: 'auto', background: 'white' }}>
              <Frame data={pageAdmin?.craftData ? JSON.stringify(pageAdmin.craftData) : undefined}>
                <Element is={CraftSection} customStyle={{ padding: 40 }} canvas />
              </Frame>
            </div>
          </StyledContent>
        </StyledScrollBar>
        <SettingBlock pageId={pageAdmin?.id} onRefetch={onRefetch} />
      </div>
    </Editor>
  )
}

const SettingBlock: React.VFC<{
  pageId?: string
  onRefetch?: () => void
}> = ({ pageId, onRefetch }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const { updateAppPage } = useMutateAppPage()
  const [active, setActive] = useState<CraftToolboxCategory>('basic')
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
      <CraftSettingsModal />
      <StyledTabs
        renderTabBar={(props, DefaultTabBar) => (
          <StyledTabBarWrapper>
            <DefaultTabBar {...props} className="mb-0" />
            <Button disabled={!isDataChanged} loading={loading} type="primary" onClick={handleSubmit}>
              {formatMessage(messages.saveAndUpdate)}
            </Button>
          </StyledTabBarWrapper>
        )}
      >
        <StyledTabsPane key="basic" tab={<StyledPageIcon />}>
          <CraftToolBox category="basic" />
        </StyledTabsPane>
        <StyledTabsPane key="product" tab={<StyledPageIcon />}>
          <CraftToolBox category="product" />
        </StyledTabsPane>
        <StyledTabsPane key="template" tab={<StyledPageIcon />}>
          <CraftToolBox category="template" />
        </StyledTabsPane>
      </StyledTabs>
    </StyledSettingBlock>
  )
}

export default CraftPageSettingBlock
